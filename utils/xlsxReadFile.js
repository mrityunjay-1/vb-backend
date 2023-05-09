const xlsx = require("xlsx");

const readDataFromXlsxFileBuffer = (buffer) => {
    try {

        const wb = xlsx.read(buffer);

        const ws = wb.Sheets[wb.SheetNames[0]];

        const data = xlsx.utils.sheet_to_json(ws);

        return data;

    } catch (err) {
        console.log("Error: ", err);
    }
}

module.exports = {
    readDataFromXlsxFileBuffer
}