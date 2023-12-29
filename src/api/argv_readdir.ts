import { readdirSync, statSync } from "fs";
import { join } from "path";

interface IStructure {
    [x:string]:any;
}

function readDirectoryStructure(targetDir:string) {
    const structure:IStructure = {};
  
    // Read the source directory
    const files = readdirSync(targetDir);
  
    // Iterate through files in the source directory
    for (const file of files) {
      const srcPath = join(targetDir, file);
  
      // Check if the current file is a directory
      if (statSync(srcPath).isDirectory()) {
        // Recursively read subdirectories
        structure[file] = readDirectoryStructure(srcPath);
      } else {
        // Mark files with a flag (e.g., true)
        structure[file] = true;
      }
    }
  
    return structure;
  }

export function argv_readdir(targetDir:string){
    const structure = readDirectoryStructure(targetDir);
    console.dir(structure);
}
//     /**
//          * MAIN
//          */
//         const filelistPath = `D:\\renamer\\filelists\\filelist.txt`;
        
//         // const fInf = fs.readFileSync(configFilelist, 'utf-8');
//         const fileListTemplatePath = fs.readFileSync(filelistPath, 'utf-8');
//         const fileListContent = fileListTemplatePath.split(EOL);

//         if (fs.statSync(filelistPath).isFile()) {

//             try {
//                 DetermineTitle(fileListContent, extensions);
//             } catch (err) {
//                 console.log(chalk.red(`The title got messed up!`));
//                 console.error(err);
//             }

//             try {

//                 // const tpath = `${path.dirname(import.meta.url)}/pseudoFiles/${argv.testFilesCreate}`.replace('file:///', '');


//                 const iterateContent = fileListContent.values();
//                 let next = iterateContent.next();


//                 while (!next.done) {
//                     // await Detective(next.value, omdbConfig, extensions, argv.logLevel);
//                     next = iterateContent.next();
//                 }

//             } catch (err) {
//                 console.log(chalk.red(`Something weird, really?!?`));
//                 console.error(err);
//             }

//             didSomething = true;


//         } else {
//             console.log(`Please provide parameter --testFileSourcePath`)
//         }

//         if (typeof argv.targetDir !== 'undefined') {
//             didSomething = true;
//         }

//         if (!didSomething) console.log(chalk.yellow(`Try node dist/main.js --help`));

//     }  
// }