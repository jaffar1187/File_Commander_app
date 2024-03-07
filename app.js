const fs = require("fs/promises");
const command_file = "./command.txt";
const CREATE_FILE = "create a file";
const DELETE_FILE = "delete a file";
const RENAME_FILE = "rename a file";
const ADD_TO_FILE = "add to the file";

let commandFileHandler;

const start = async () => {
  // Opening the file so that it can be read later.
  commandFileHandler = await fs.open(command_file, "r");
  //Handling changes
  commandFileHandler.on("change", changesHandler);

  //Watcher..
  const watcher = fs.watch(command_file); //Watching for changes

  //async iterator
  for await (const event of watcher) {
    //Checking if file is changed
    if (event.eventType === "change" && event.filename === "command.txt")
      commandFileHandler.emit("change");
  }
};

const changesHandler = async () => {
  //getting the file size so that we can save memory later in buffer allocation.
  const size = (await commandFileHandler.stat()).size;
  const buff = Buffer.alloc(size);

  //The location at which we need to start filling the buffer
  const offset = 0;
  //The position from where we will start reading the file
  const position = 0;
  //How many bytes we will read
  const length = buff.byteLength;
  // Reading the file contents
  await commandFileHandler.read(buff, offset, length, position);
  //Decoding data
  const command = buff.toString("utf-8");

  // 1> Create a file:
  // Format create a file <path>

  if (command.includes(CREATE_FILE)) {
    const filePath = command.substring(CREATE_FILE.length + 1);
    await createFile(filePath);
  }

  // 2> Delete a file
  else if (command.includes(DELETE_FILE)) {
    const filePath = command.substring(DELETE_FILE.length + 1);
    await deleteFile(filePath);
  }

  // 3> Rename a file
  else if (command.includes(RENAME_FILE)) {
    const filePath = command.substring(RENAME_FILE.length + 1);
    const old_file_path = filePath.split(" ")[0];
    const new_file_path = filePath.split(" ")[1];
    await renameFile(old_file_path, new_file_path);
  }

  // 4> Add to the file
  else if (command.includes(ADD_TO_FILE)) {
    const filePath = command.substring(ADD_TO_FILE.length + 1);
    await addTofile(filePath, "This is just some text");
  }
};

const fileExistsCheck = async (path) => {
  const existingFileHandle = await fs.open(path, "r");
  await existingFileHandle.close();
};

//File modification functions.
const createFile = async (path) => {
  try {
    // Checking if file already exists, In case it does not exists we will get an error.
    await fileExistsCheck(path);
    return console.log(`The file ${path} already exists.`);
  } catch (e) {
    //Create a new file if it does not exists.
    const newFile = await fs.open(path, "w");
    console.log("A new file was successfully created.");
    newFile.close();
  }
};

const deleteFile = async (path) => {
  try {
    // Checking if file already exists, In case it does not exists we will get an error.
    await fileExistsCheck(path);
    console.log("Deleting file...");
    await fs.unlink(path);
    return console.log(`The file ${path} is been successfully deleted.`);
  } catch (e) {
    console.log("The file does not exists.");
  }
};

const addTofile = async (path, data) => {
  try {
    // Checking if file already exists, In case it does not exists we will get an error.
    const existingFileHandle = await fs.appendFile(path, data);
    await existingFileHandle.close();
    return console.log(`Added data to file successfully.`);
  } catch (e) {
    console.log("Some error occurred while adding to file.");
  }
};

const renameFile = async (old_file_path, new_file_path) => {
  try {
    // Checking if file already exists, In case it does not exists we will get an error.
    await fileExistsCheck(old_file_path);
    console.log("Renaming file...");
    await fs.rename(old_file_path, new_file_path);
    return console.log(`The file is been successfully renamed.`);
  } catch (e) {
    console.log("The file does not exists.");
  }
};

//Initiating.
start();
