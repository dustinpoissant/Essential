import {
	readdir,
	stat
} from 'node:fs/promises';
const suites = process.argv.slice(2)

const readFullDir = path => new Promise( async (resolve) => {
	const all = [];
	const root = await readdir(path);
	for( let item of root) {
		const isDirectory = (await stat(`${path}/${item}`)).isDirectory();
		if(isDirectory){
			const subPath = `${path}/${item}`;
			(await readFullDir(subPath)).forEach( file => {
				all.push(`${subPath}/${file}`);
			});
		} else {
			all.push(item);
		}
	}
	resolve(all);
});

const files = await readFullDir('./test');
const allTests = files.filter(f=>f.endsWith('.test.js')).map(f=>`./${f.split('./test/')[1]}`);
const tests =
	(suites.length == 0)?
		allTests :
		allTests.filter( filename => suites.some( suite => filename.toLowerCase().includes(suite.toLowerCase())));

let totalTestsRanCount = 0;
let totalTestsFailedCount = 0;
for(let testFileName of tests){
	let suitTestsRanCount = 0;
	let suitTestsFailedCount = 0;
	const pass = (message = 'Test Passed')=>{
		totalTestsRanCount++;
		suitTestsRanCount++;
		console.log(`    \x1b[32m✓ ${message}\x1b[0m`);
	}
	const fail = (message = 'Test Failed')=>{
		totalTestsRanCount++;
		suitTestsRanCount++;
		totalTestsFailedCount++;
		suitTestsFailedCount++;
		console.log(`    \x1b[31m𐄂 ${message}\x1b[0m`);
	}
	console.log(`\x1b[36mRunning Test Suite: ${testFileName}` ,'\x1b[0m');
	const module = await import(testFileName);
	const tests = module.default;
	if(module.beforeAll) module.beforeAll();
	const testNames = Object.keys(tests);
	for(let testName of testNames){
		console.log(`  \x1b[34mRunning Test: ${testName}\x1b[0m`);
		if(module.beforeEach) module.beforeEach();
		const test = tests[testName];
		const cleanup = await test(pass, fail);
		if(typeof(cleanup) === 'function') await cleanup();
		if(module.afterEach) module.afterEach();
	}
	if(module.afterAll) module.afterAll();
	console.log(`Results for: ${testFileName}` ,'\x1b[0m');
	console.log(`  Total: ${suitTestsRanCount}`);
	console.log(`  \x1b[32mPassed: ${suitTestsRanCount - suitTestsFailedCount}\x1b[0m`);
	if(suitTestsFailedCount > 0){
		console.log(`  \x1b[31mFailed: ${suitTestsFailedCount}\x1b[0m`);
	}
}
console.log('Results for all Test Suites' ,'\x1b[0m');
console.log(`  Total: ${totalTestsRanCount}`);
console.log(`  \x1b[32mPassed: ${totalTestsRanCount - totalTestsFailedCount}\x1b[0m`);
if(totalTestsFailedCount > 0){
	console.log(`  \x1b[31mFailed: ${totalTestsFailedCount}\x1b[0m`);
}