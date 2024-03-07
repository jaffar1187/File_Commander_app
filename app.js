const fs = require("fs/promises");
const command_file = "./command.txt";
const CREATE_FILE = "create a file";
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
    //Checking if file is change
    if (event.eventType === "change" && event.filename === "command.txt")
      commandFileHandler.emit("change");
  }
};

const createFile = async (path) => {
  try {
    // Checking if file already exists, In case it does not exists we will get an error.
    const existingFileHandle = await fs.open(path, "r");
    existingFileHandle.close();
    return console.log(`The file ${path} already exists.`);
  } catch (e) {
    //Create a new file if it does not exists.
    const newFile = await fs.open(path, "w");
    console.log("A new file was successfully created.");
    newFile.close();
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
};

//Initiating.
start();
