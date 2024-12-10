function organizeFilesByYear() {
  try {
    // Get the current spreadsheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
    sheet.clear(); // Clear any existing data
    sheet.appendRow(["File Name", "Creation Date", "File URL", "Destination Folder"]);

    // Get the root folder of My Drive
    const rootFolder = DriveApp.getRootFolder();
    const rootFolderId = rootFolder.getId();
    const files = rootFolder.getFiles(); // Get all files in My Drive root

    while (files.hasNext()) {
      const file = files.next();
      const fileName = file.getName();
      const creationDate = file.getDateCreated();
      const year = creationDate.getFullYear().toString();
      const fileUrl = file.getUrl();

      // Explicitly check if the file is truly in the root folder
      const parents = file.getParents();
      let isInRoot = false;

      while (parents.hasNext()) {
        const parent = parents.next();
        if (parent.getId() === rootFolderId) {
          isInRoot = true;
          break;
        }
      }

      if (!isInRoot) {
        Logger.log(`Skipping file: ${fileName} (not directly in root)`);
        continue; // Skip files not directly in the root folder
      }

      // Get or create a folder for the year
      let yearFolder = null;
      const yearFolders = rootFolder.getFoldersByName(year);

      if (yearFolders.hasNext()) {
        yearFolder = yearFolders.next();
      } else {
        yearFolder = rootFolder.createFolder(year);
      }

      // Move the file to the appropriate folder
      try {
        file.moveTo(yearFolder);
     //   Logger.log(`Moved file: ${fileName} to folder: ${year}`);
        // Log the file details into the spreadsheet
        sheet.appendRow([fileName, creationDate, fileUrl, yearFolder.getName()]);
      } catch (error) {
        Logger.log(`Error moving file: ${fileName}. Error: ${error.message}`);
      }
    }

    Logger.log("File organization completed.");
  } catch (error) {
    Logger.log(`Error: ${error.message}`);
  }
}
