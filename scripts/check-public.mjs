import {verifySource,verifyBuild} from './public-policy.mjs'
const files=verifySource(process.cwd()),assets=verifyBuild(process.cwd())
console.log(`PASS: ${files} exact public files, ${assets} static assets, hashes and text policy. Pattern scanning is not a universal secret detector.`)
