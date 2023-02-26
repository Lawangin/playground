mport * as pulumi from "@pulumi/pulumi";

import * as aws from "@pulumi/aws";



// Create a new VPC 

const vpc = new aws.ec2.Vpc("vpc", {

    cidrBlock: "10.0.0.0/16",

});



// Create public and private subnets 

const publicSubnet = new aws.ec2.Subnet("public", {

    vpcId: vpc.id,

    cidrBlock: "10.0.1.0/24",

    mapPublicIpOnLaunch: true,

});

const privateSubnet = new aws.ec2.Subnet("private", {

    vpcId: vpc.id,

    cidrBlock: "10.0.2.0/24",

});



// Create an RDS database instance in the private subnet 

const dbSubnetGroup = new aws.rds.SubnetGroup("db_subnet_group", {

    subnetIds: [privateSubnet.id],

});

const db = new aws.rds.Instance("db", {

    subnetGroupName: dbSubnetGroup.name,

    allocatedStorage: 20,

    engine: "postgres",

    instanceClass: "db.t2.micro",

    vpcSecurityGroupIds: [],

    publiclyAccessible: false,

});
// Update the VPC security group to allow access from the public subnet
const securityGroup = new aws.ec2.SecurityGroup("security_group", {
    vpcId: vpc.id,
    ingress: [
        {
            protocol: "tcp",
            fromPort: 5432,
            toPort: 5432,
            cidrBlocks: [publicSubnet.cidrBlock],
        },
    ],
});

// Update the RDS instance to use the new security group
db.vpcSecurityGroupIds = [securityGroup.id];

const cluster = new aws.ecs.Cluster("cluster", {
    // This variable represents an Amazon Elastic Container Service (ECS) cluster
    // The name of the cluster is "cluster"
    // The VPC ID is taken from the `vpc` variable
    vpcId: vpc.id
});

const taskDefinition = new aws.ecs.TaskDefinition("task-definition", {
    // This variable represents an ECS task definition
    // The name of the task definition is "task-definition"
    // The task definition contains a single container definition, which is defined inline
    containerDefinitions: [
        {
            // This variable represents a container in the task definition
            // The container is based on the Docker image "nextjs-app:latest"
            // The container exposes port 3000 and maps it to the host's port 3000
            image: "nextjs-app:latest",
            portMappings: [
                {
                    containerPort: 3000,
                    hostPort: 3000
                }
            ]
        }
    ]
});

const lb = new aws.lb.LoadBalancer("lb", {
    // This variable represents an Amazon Elastic Load Balancer (ELB)
    // The name of the ELB is "lb"
    // The ELB is not internal, meaning it is accessible from the internet
    // The ELB is associated with the security group specified in the `securityGroup` variable
    // The ELB is placed in the subnet specified in the `publicSubnet` variable
    internal: false,
    securityGroups: [securityGroup.id],
    subnets: [publicSubnet.id],
});

const listener = new aws.lb.Listener("listener", {
    // listener for the load balancer
    loadBalancerArn: lb.arn,
    // port for the listener
    port: 80,
    // default actions for the listener
    defaultActions: [
        {
            // action type
            type: "forward",
            // target group ARN
            targetGroupArn: targetGroup.arn,
        }
    ],
});

const targetGroup = new aws.lb.TargetGroup("target-group", {
    // port for the target group
    port: 3000,
    // protocol for the target group
    protocol: "TCP",
    // VPC ID
    vpcId: vpc.id,
});

const service = new aws.ecs.Service("service", {
    // cluster ID
    cluster: cluster.id,
    // task definition ARN
    taskDefinition: taskDefinition.arn,
    // desired number of tasks
    desiredCount: 1,
    // subnet IDs
    subnetIds: [publicSubnet.id],
    // load balancer ARNs
    loadBalancerArns: [lb.arn],
});