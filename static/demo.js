// CREATE TABLE Reception (
//     SL_NO INT AUTO_INCREMENT PRIMARY KEY,
//     Date TEXT,
//     Name_Of_Visitor TEXT,
//     Number_Of_Visitors INT,
//     Address TEXT,
//     Purpose TEXT,
//     To_Whom_Meet TEXT,
//     Time_In TEXT,
//     Time_Out TEXT,
//     Mobile_No TEXT,
//     transactionDate TEXT,
//     transactionCreatedDate TEXT
// );

// ALTER TABLE Persons AUTO_INCREMENT=1;

// let date = new Date("2024-11-29");
// let day = date.toLocaleString('en-us', {weekday: 'long'});
// console.log(day);

// let inputdate = "28/11/2024";
// let [day, month, year] = inputdate.split('/').map(Number);
// let date = new Date(year, month - 1, day);
// let weekday = date.toLocaleString('en-us', { weekday: 'long' });
// console.log(weekday);

app.get('/download-pdf', (req, res) => {
    const filePath = path.join(__dirname, 'files', 'sample.pdf'); // Adjust path as needed
    res.download(filePath, 'sample.pdf', (err) => {
        if (err) {
            console.error('Error during file download:', err);
        }
    });
});

document.getElementById('downloadBtn').addEventListener('click', function () {
    fetch('/download-pdf')
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'sample.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => console.error('Error downloading PDF:', error));
});

