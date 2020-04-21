function main() {
    console.log("test");

    return 1;
}

let a = 4
console.assert(a == 5, 'uh oh')

if (main() != 0) {
    throw new Error('sldkjflsdkajf')
}