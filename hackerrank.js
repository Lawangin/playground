function jumpingOnClouds(c) {
    // Write your code here
    
    // record result
    let jumps = 0;
    
    // record state of current element
    let thunder = false;
    
    let cloudHolder = []
    
    // loop through cloud
    for (let i = 0; i < c.length; i++) {
        
        if (c[i] === 1) {
            cloudHolder.length = 0;
            if (c[i+1] && c[i+1] === 1) {
                continue;
            }

            if (cloudHolder.length >= 2) {
                jumps += 1;
            }

            // jumps += 1;
        }
        
        if (c[i] === 0) {
            cloudHolder.push(0);

            if (i != 0 && cloudHolder.length === 1) {
                jumps += 1;
            }

            if (cloudHolder.length === 0) {
                jumps += 1;
            }
        }
        
    }

    return jumps;
}

const c = [0,1,0,0,1,0];
const d = [0, 0, 1, 0, 0, 1, 0];

console.log(jumpingOnClouds(c));