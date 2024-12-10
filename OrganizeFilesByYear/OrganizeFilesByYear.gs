function organizeFilesByYearAndDate() {
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
      const dateFolderName = creationDate.toISOString().split('T')[0]; // YYYY-MM-DD
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

      // Get or create the year folder
      let yearFolder = null;
      const yearFolders = rootFolder.getFoldersByName(year);

      if (yearFolders.hasNext()) {
        yearFolder = yearFolders.next();
      } else {
        yearFolder = rootFolder.createFolder(year);
      }

      // Get or create the date folder within the year folder
      let dateFolder = null;
      const dateFolders = yearFolder.getFoldersByName(dateFolderName);

      if (dateFolders.hasNext()) {
        dateFolder = dateFolders.next();
      } else {
        dateFolder = yearFolder.createFolder(dateFolderName);
      }

      // Move the file to the appropriate folder
      try {
        file.moveTo(dateFolder);
        Logger.log(`Moved file: ${fileName} to folder: ${year}/${dateFolderName}`);
        // Log the file details into the spreadsheet
        sheet.appendRow([fileName, creationDate, fileUrl, `${year}/${dateFolderName}`]);
      } catch (error) {
        Logger.log(`Error moving file: ${fileName}. Error: ${error.message}`);
      }
    }

    Logger.log("File organization completed.");
  } catch (error) {
    Logger.log(`Error: ${error.message}`);
  }
}
