import express from 'express';
import mysql from 'mysql2/promise';
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import xlsx from 'xlsx';
import notifier from 'node-notifier';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import http from 'http';
dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.port;
const JWT_SECRET = process.env.JWT_SECRET;

const pool = mysql.createPool({
    uri: `mysql://${process.env.user}:${process.env.dbpassword}@${process.env.host}:${process.env.dbport}/${process.env.database}`,
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'static'));
app.use(express.static('static'));
app.use(express.static(path.join(__dirname, 'static')));
app.use(cookieParser());
app.use(cors());
app.setMaxListeners(1000);
app.use(session({
    secret: process.env.appsecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 60 * 1000
    }
}));

// Creation and deletion of tables
// Create users table 
app.get('/create/usersTable', async (req, res) => {
    let query = `CREATE TABLE Users (
    SL_NO INT AUTO_INCREMENT,
    Location TEXT,
    EmployeeId TEXT,
    Username TEXT,
    Password TEXT,
    UserType TEXT,
    TransactionDate TEXT,
    TransactionCreatedDate TEXT,
    PRIMARY KEY(SL_NO)
)`;
    await pool.execute(query);
    query = `ALTER TABLE Reception AUTO_INCREMENT = 1`;
    await pool.execute(query);
    const [result] = await pool.execute(query);
    notifier.notify({
        title: 'Salutations!',
        message: 'Users table created successfully!!',
        icon: path.join(__dirname, 'static', 'table.png'),
        sound: true,
        wait: true
    });
    res.redirect('/home');
});

// Create reception table 
app.get('/create/receptionTable', async (req, res) => {
    let query = `CREATE TABLE Reception (
    SL_NO INT AUTO_INCREMENT,
    Date TEXT,
    Location TEXT,
    Name_Of_Visitor TEXT,
    Number_Of_Visitors TEXT,
    Address TEXT,
    Purpose TEXT,
    To_Whom_Meet TEXT,
    Scheduled_Time TEXT,
    Time_In TEXT,
    Time_Out TEXT,
    Duration TEXT,
    Mobile_No TEXT,
    TransactionDate TEXT,
    TransactionCreatedDate TEXT,
    VisitorStatus TEXT,
    TransactionCreatedBy TEXT,
    PRIMARY KEY(SL_NO)
)`;
    await pool.execute(query);
    query = `ALTER TABLE Reception AUTO_INCREMENT = 1`;
    await pool.execute(query);
    const [result] = await pool.execute(query);
    notifier.notify({
        title: 'Salutations!',
        message: 'Reception table created successfully!!',
        icon: path.join(__dirname, 'static', 'table.png'),
        sound: true,
        wait: true
    });
    res.redirect('/home');
});

// Create conference table
app.get('/create/conferenceTable', async (req, res) => {
    let query = `CREATE TABLE Conference (
    SL_NO INT AUTO_INCREMENT,
    Name_Of_Person TEXT,
    Date TEXT,
    Location TEXT,
    Room_No TEXT,
    Meeting_Start_Time TEXT,
    Meeting_End_Time TEXT,
    TransactionDate TEXT,
    TransactionCreatedDate TEXT,
    TransactionCreatedBy TEXT,
    PRIMARY KEY(SL_NO)
)`;
    await pool.execute(query);
    query = `ALTER TABLE Conference AUTO_INCREMENT = 1`;
    await pool.execute(query);
    const [result] = await pool.execute(query);
    notifier.notify({
        title: 'Salutations!',
        message: 'Conference table created successfully!!',
        icon: path.join(__dirname, 'static', 'table.png'),
        sound: true,
        wait: true
    });
    res.redirect('/home');
});

// Drop reception table
app.get('/drop/ReceptionTable', async (req, res) => {
    let query = `Drop TABLE Reception`;
    const [result] = await pool.execute(query);
    notifier.notify({
        title: 'Salutations!',
        message: 'Reception table dropped successfully!!',
        icon: path.join(__dirname, 'static', 'table.png'),
        sound: true,
        wait: true
    });
    res.redirect('/home');
});

// Drop conference table
app.get('/drop/ConferenceTable', async (req, res) => {
    let query = `Drop TABLE Conference`;
    const [result] = await pool.execute(query);
    notifier.notify({
        title: 'Salutations!',
        message: 'Conference table dropped successfully!!',
        icon: path.join(__dirname, 'static', 'table.png'),
        sound: true,
        wait: true
    });
    res.redirect('/home');
});

// GET requests for all the pages
// Login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'login.html'));
});

// Home page
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'home.html'));
});

// User-management page
app.get('/user_management', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'user_management.html'));
});

// Add visitor page
app.get('/add', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'add.html'));
});

// Update visitor page
app.get('/update', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'update.html'));
});

// Display visitors page
app.get('/display', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'display.html'));
});

// Conference booking page 
app.get('/conference', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'conference.html'));
});

// Time format functions
// Change time format from 24 Hr to 12 Hr format
function changeTimeFormat(time) {
    var [h, m] = time.split(":");
    var amOrPm = h >= 12 ? ' PM' : ' AM';
    var time = ((h % 12 ? h % 12 : 12) + ":" + m + amOrPm);
    return time;
}

// Change time format from 12 Hr to 24 Hr format
function reverseTimeFormat(time) {
    const [hrMin, amOrPm] = time.split(" ");
    let [hr, min] = hrMin.split(":").map(Number);
    if (amOrPm === 'PM' && hr !== 12) hr += 12;
    if (amOrPm === 'AM' && hr === 12) hr = 0;
    return `${hr.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
}

// Split time into hr and min
function stringToNum(time) {
    let [hr, min] = time.split(":").map(String);
    return Number((hr + min));
}

// Login end, session data end and logout end
// Login user using Location, Employee Id, Password
app.get('/loginUser/:location/:employeeId/:password', async (req, res) => {
    const location = req.params.location;
    const employeeId = req.params.employeeId;
    const password = req.params.password;
    if (!location || !employeeId || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    var hashedPassword = "";
    for (let i = 0; i < password.length; i++) {
        hashedPassword += process.env.secret_one + password.charCodeAt(i) + process.env.secret_two;
    }

    const query = `SELECT * FROM Users WHERE location = ? AND employeeId = ? AND password = ?`;

    try {
        const [result] = await pool.execute(query, [location, employeeId, hashedPassword]);
        if (result.length > 0) {
            req.session.user = {
                employeeId: result[0].EmployeeId,
                username: result[0].Username,
                userLocation: result[0].Location,
                userType: result[0].UserType
            };
            req.session.save();
            res.status(200).json({ message: 'Successful login' });;
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error during login:', error);

        if (error.code === 'ER_BAD_FIELD_ERROR') {
            return res.status(500).json({ message: 'Database error: Invalid query field' });
        }

        if (error.code === 'ECONNREFUSED') {
            return res.status(500).json({ message: 'Database connection failed. Please try again later.' });
        }

        res.status(500).json({ message: 'An unexpected error occurred. Please try again later.', details: error.message });
    }
});

// Fetch session data
app.get('/sessionData', async (req, res) => {
    if (req.session.user) {
        res.json({
            employeeId: req.session.user.employeeId,
            username: req.session.user.username,
            userLocation: req.session.user.userLocation,
            userType: req.session.user.userType
        });
    } else {
        res.json({ employeeId: null, username: null, userLocation: null, userType: null });
    }
});

// Logout from the portal
app.get('/logout', async (req, res) => {
    if (req.session.user) {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).send('Could not log out.');
            }
        });
        notifier.notify({
            title: 'Salutations!!',
            message: 'You have successfully logged out!!',
            icon: path.join(__dirname, 'static', 'success.png'),
            sound: true,
            wait: true
        });
        res.status(200).json({ message: 'Logout Successful' });
    }
});

// Register user for the portal
app.post('/registerUser', async (req, res) => {
    var current_date = new Date();
    var date_time = current_date.toLocaleDateString() + ' ' + current_date.toLocaleTimeString() + ' Created';
    var transactionDate = date_time;
    var transactionCreatedDate = date_time;
    const { location, employeeId, password, username, userType } = req.body;
    var hashedPassword = "";
    for (let i = 0; i < password.length; i++) {
        hashedPassword += process.env.secret_one + password.charCodeAt(i) + process.env.secret_two;
    }
    const query = `
        INSERT INTO Users (
            location,employeeId,password,username,userType,TransactionDate,TransactionCreatedDate
        ) VALUES (?,?,?,?,?,?,?)
    `;

    try {
        const [result] = await pool.execute(query, [location, employeeId, hashedPassword, username, userType, transactionDate, transactionCreatedDate]);
        notifier.notify({
            title: 'Salutations!',
            message: 'User added successfully!!',
            icon: path.join(__dirname, 'static', 'success.png'),
            sound: true,
            wait: true
        });
        res.status(200).json({ message: 'User added successfully', result });
    } catch (error) {
        console.error('Error inserting user:');
        res.status(500).json({ error: 'Failed to add user', details: error.message });
    }
});

// Delete user using Location and Employee Id 
app.post('/deleteUser', async (req, res) => {
    const { location, employeeId } = req.body;
    const query = `Delete FROM Users WHERE location = ? AND employeeId = ?`;

    try {
        const [result] = await pool.execute(query, [location, employeeId]);
        if (result.affectedRows > 0) {
            notifier.notify({
                title: 'Salutations!',
                message: 'User deleted successfully!!',
                icon: path.join(__dirname, 'static', 'visitor.png'),
                sound: true,
                wait: true
            });
            res.status(200).json({ message: 'User deleted successfully', result });
        }
        else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error finding user:', error);
        res.status(500).json({ error: 'Failed to find user', details: error.message });
    }
});

// Add page
// Add visitor by filling the details 
app.post('/add', async (req, res) => {
    var current_date = new Date();
    var date_time = current_date.toLocaleDateString() + ' ' + current_date.toLocaleTimeString() + ' Created';
    var transactionDate = date_time;
    var transactionCreatedDate = date_time;
    var { date, userLocation, name_of_visitor, number_of_visitors, address,
        purpose, to_whom_meet, hours_timein, hours_timeout, minutes_timein, minutes_timeout, ampm_timein, ampm_timeout, mobile_no, duration, username } = req.body;
    var date_of_visit = new Date(date);
    date_of_visit = date_of_visit.toLocaleDateString();
    var status = 'Approved';
    var time_in, time_out;
    time_in = hours_timein + ":" + minutes_timein + " " + ampm_timein;
    time_out = hours_timeout + ":" + minutes_timeout + " " + ampm_timeout;
    var scheduled_time = time_in;
    var transactionCreatedBy = username;
    if (time_in === ': AM') {
        time_in = '10:00 AM';
    }
    if (time_out === ': AM') {
        time_out = '6:30 PM';
    }
    const query = `
        INSERT INTO reception (
            Date,Location,Name_Of_Visitor,Number_of_Visitors,Duration,Scheduled_Time,Address,Purpose,To_Whom_Meet,Time_In,Time_Out,Mobile_No,TransactionDate,TransactionCreatedDate,VisitorStatus,TransactionCreatedBy
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    try {
        const [result] = await pool.execute(query, [
            date_of_visit, userLocation, name_of_visitor, number_of_visitors, duration, scheduled_time, address, purpose, to_whom_meet, time_in, time_out, mobile_no,
            transactionDate, transactionCreatedDate, status, transactionCreatedBy
        ]);

        notifier.notify({
            title: 'Salutations!',
            message: 'Visitor added successfully!!',
            icon: path.join(__dirname, 'static', 'visitor.png'),
            sound: true,
            wait: true
        });
        return res.status(200).json({ message: 'Visitor added successfully' });
    } catch (error) {
        console.error('Error adding visitor:', error);
        notifier.notify({
            title: 'Error Occurred!!',
            message: 'Error adding visitor!!',
            icon: path.join(__dirname, 'static', 'warning.png'),
            sound: true,
            wait: true
        });
        return res.status(400).json({ message: 'Error adding visitor' });;
    }
});

// Request visitor on filling the details 
app.post('/request', async (req, res) => {
    var current_date = new Date();
    var date_time = current_date.toLocaleDateString() + ' ' + current_date.toLocaleTimeString() + ' Created';
    var transactionDate = date_time;
    var transactionCreatedDate = date_time;
    var { date, userLocation, name_of_visitor, number_of_visitors, address,
        purpose, to_whom_meet, mobile_no, duration, hours, minutes, ampm, username } = req.body;
    var date_of_visit = new Date(date);
    date_of_visit = date_of_visit.toLocaleDateString();
    var status = 'Pending';
    var scheduled_time = hours + ":" + minutes + " " + ampm;
    var transactionCreatedBy = username;
    const query = `
        INSERT INTO reception (
            Date,Location,Name_Of_Visitor,Number_of_Visitors,Duration,Scheduled_time,Address,Purpose,To_Whom_Meet,Mobile_No,TransactionDate,TransactionCreatedDate,VisitorStatus,TransactionCreatedBy
        ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    try {
        const [result] = await pool.execute(query, [
            date_of_visit, userLocation, name_of_visitor, number_of_visitors, duration, scheduled_time, address, purpose, to_whom_meet, mobile_no,
            transactionDate, transactionCreatedDate, status, transactionCreatedBy
        ]);

        notifier.notify({
            title: 'Salutations!',
            message: 'Visitor request done successfully!!',
            icon: path.join(__dirname, 'static', 'visitor.png'),
            sound: true,
            wait: true
        });
        return res.status(200).json({ message: 'Visitor request done successfully' });
    } catch (error) {
        console.error('Error adding visitor:', error);
        notifier.notify({
            title: 'Error Occurred!!',
            message: 'Error adding visitor!!',
            icon: path.join(__dirname, 'static', 'warning.png'),
            sound: true,
            wait: true
        });
        return res.status(400).json({ message: 'Error adding visitor' });
    }
});

// Get the pending requests for the given user-location, either the receptionist or the admin will approve
app.get('/getNotifications/:userLocation', async (req, res) => {
    const userLocation = req.params.userLocation;
    var query = `Select * from Reception WHERE Location = ? and VisitorStatus = ? Order By Sl_No Desc Limit 6`;

    try {
        const [results] = await pool.execute(query, [userLocation, 'Pending']);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).send({ message: 'Error fetching bookings' });
    }
});

// Approve the visitor request using sl no
app.post('/approve/:sl_no', async (req, res) => {
    var current_date = new Date();
    var date_time = current_date.toLocaleDateString() + ' ' + current_date.toLocaleTimeString() + ' Approved';
    const sl_no = req.params.sl_no;
    const query = `Update Reception Set visitorStatus = ?,TransactionDate = ? Where sl_no = ?
    `;
    try {
        const [result] = await pool.execute(query, ['Approved', date_time, sl_no
        ]);
        // console.log(result);
        notifier.notify({
            title: 'Salutations!',
            message: 'Visitor request approved successfully!!',
            icon: path.join(__dirname, 'static', 'visitor.png'),
            sound: true,
            wait: true
        });
        return res.status(200).json({ message: 'Visitor request approved successfully' });
    } catch (error) {
        console.error('Error while approving visitor:', error);
        notifier.notify({
            title: 'Error Occurred!!',
            message: 'Error while approving visitor!!',
            icon: path.join(__dirname, 'static', 'warning.png'),
            sound: true,
            wait: true
        });
        return res.status(500).json({ message: 'Error adding visitor' });
    }
});

// Search visitor by passing parameter
app.get('/search/:searchField/:searchValue', async (req, res) => {
    const searchField = req.params.searchField;
    var searchValue = req.params.searchValue;
    // console.log(searchField);
    if (searchField === 'date') {
        searchValue = new Date(searchValue).toLocaleDateString();
    }
    const query = `SELECT * FROM reception where ${searchField} like ?`;
    try {
        const [visitors] = await pool.execute(query, [`%${searchValue}%`]);
        if (visitors.length > 0) {
            res.status(200).json(visitors);
        } else {
            notifier.notify({
                title: 'Error Occurred!!',
                message: 'No visitors found with the given criteria!!',
                icon: path.join(__dirname, 'static', 'warning.png'),
                sound: true,
                wait: true
            });
            return res.redirect('/update');
        }
    } catch (error) {
        console.error('Error fetching visitor:', error);
        notifier.notify({
            title: 'Error Occurred!!',
            message: 'Error fetching visitor!!',
            icon: path.join(__dirname, 'static', 'warning.png'),
            sound: true,
            wait: true
        });
        return res.redirect('/update');
    }
});

// Update visitor by passing parameter
app.post('/update', async (req, res) => {
    var current_date = new Date();
    var date_time = current_date.toLocaleDateString() + ' ' + current_date.toLocaleTimeString() + ' Modified';
    const sl_no = req.body.sl_no;
    const updateField = req.body.updateField;
    var updatedValue = req.body.updatedValue;
    if (updateField === 'date') {
        updatedValue = new Date(updatedValue).toLocaleDateString();
    }
    else if (updateField == 'time_in' || updateField == 'time_out' || updateField == 'scheduled_time') {
        var hours__time = req.body.hours__time;
        var minutes__time = req.body.minutes__time;
        var ampm__time = req.body.ampm__time;
        updatedValue = hours__time + ":" + minutes__time + " " + ampm__time;
    }
    const query = `
        Update reception SET ${updateField} = ? , transactionDate = ? where sl_no = ?
    `;
    const values = [];
    values.push(updatedValue);
    values.push(date_time);
    values.push(sl_no);
    // console.log({ sl_no, updatedValue, date_time });
    try {
        let safeQuery = `SET SQL_SAFE_UPDATES=0`;
        await pool.execute(safeQuery);
        const [result] = await pool.execute(query, values);
        safeQuery = `SET SQL_SAFE_UPDATES=1`;
        await pool.execute(safeQuery);
        if (result.changedRows == 0) {
            notifier.notify({
                title: 'Error Occurred!!',
                message: 'Visitor not found!!',
                icon: path.join(__dirname, 'static', 'warning.png'),
                sound: true,
                wait: true
            });
            return res.status(401).json({ message: 'Visitor not found!!' });
        }
        notifier.notify({
            title: 'Salutations!!',
            message: 'Visitor updated successfully!!',
            icon: path.join(__dirname, 'static', 'visitor.png'),
            sound: true,
            wait: true
        });
        res.status(200).json({ message: 'Visitor updated successfully!!' });
    } catch (error) {
        console.error('Error updating visitor:', error);
        notifier.notify({
            title: 'Error Occurred!!',
            message: 'Error updating visitor!!',
            icon: path.join(__dirname, 'static', 'warning.png'),
            sound: true,
            wait: true
        });
        return res.status(500).json({ message: 'Error updating visitor!!' });
    }
});

// Delete visitor by passing parameter
app.post('/deleteVisitor', async (req, res) => {
    const sl_no = req.body.sl_no;
    const query = `
        Delete from reception where SL_NO = ?
    `;
    const values = [];
    values.push(sl_no);
    // console.log({ sl_no});
    try {
        let safeQuery = `SET SQL_SAFE_UPDATES=0`;
        await pool.execute(safeQuery);
        const [result] = await pool.execute(query, values);
        safeQuery = `SET SQL_SAFE_UPDATES=1`;
        await pool.execute(safeQuery);
        // console.log(result);
        if (result.affectedRows == 0) {
            notifier.notify({
                title: 'Error Occurred!!',
                message: 'Visitor not found!!',
                icon: path.join(__dirname, 'static', 'warning.png'),
                sound: true,
                wait: true
            });
            return res.status(401).json({ message: 'Visitor not found!!' });
        }

        notifier.notify({
            title: 'Salutations!!',
            message: 'Visitor deleted successfully!!',
            icon: path.join(__dirname, 'static', 'visitor.png'),
            sound: true,
            wait: true
        });
        res.status(200).json({ message: 'Visitor updated successfully!!' });
    } catch (error) {
        console.error('Error deleting visitor:', error);
        notifier.notify({
            title: 'Error Occurred!!',
            message: 'Error deleting visitor!!',
            icon: path.join(__dirname, 'static', 'warning.png'),
            sound: true,
            wait: true
        });
        return res.status(500).json({ message: 'Error deleting visitor!!' });
    }
});

// Display all visitors
// If admin display all visitors otherwise display visitors according to location 
app.get('/displayAllVisitors/:userLocation/:userType', async (req, res) => {
    const userLocation = req.params.userLocation;
    const userType = req.params.userType;
    var query;
    var visitors = [];

    try {
        if (userType === 'Admin User') {
            query = 'SELECT * FROM reception';
            [visitors] = await pool.execute(query);
        }
        else {
            query = `Select * From reception where location = ?`;
            [visitors] = await pool.execute(query, [userLocation]);
        }

        if (visitors.length > 0) {
            res.status(200).json(visitors);
        } else {
            notifier.notify({
                title: 'Error Occurred!!',
                message: 'No visitors found!!',
                icon: path.join(__dirname, 'static', 'warning.png'),
                sound: true,
                wait: true
            });
            return res.redirect('/display');
        }
    } catch (error) {
        console.error('Error fetching visitors:', error);
        notifier.notify({
            title: 'Error Occurred!!',
            message: 'Error fetching visitors!!',
            icon: path.join(__dirname, 'static', 'warning.png'),
            sound: true,
            wait: true
        });
        return res.redirect('/display');
    }
});

// Display visitors daywise to show the bar-chart of no of visitors per day
app.get('/displayVisitorsDayWise/:userLocation', async (req, res) => {
    const userLocation = req.params.userLocation;
    var query = `SET sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''))`;
    await pool.execute(query);

    try {
        query = `SELECT date, count(sl_no) as number_of_visitors FROM reception WHERE Location = 'Tirumala Office' GROUP BY date ORDER BY number_of_visitors DESC, date DESC LIMIT 7;`;
        const [visitors] = await pool.execute(query);
        if (visitors.length > 0) {
            res.status(200).json(visitors);
        } else {
            return res.redirect('/home');
        }
    } catch (error) {
        console.error('Error fetching visitors:', error);
        notifier.notify({
            title: 'Error Occurred!!',
            message: 'Error fetching visitors!!',
            icon: path.join(__dirname, 'static', 'warning.png'),
            sound: true,
            wait: true
        });
        return res.redirect('/home');
    }
});

// Download all visitors data in the form of xlsx
app.get('/downloadAllVisitors', async (req, res) => {
    try {
        var results = [];
        const checkQuery = `SELECT * FROM reception`;
        [results] = await pool.execute(checkQuery);

        if (!results || results.length === 0) {
            return res.status(404).json({ message: 'No visitors found' });
        }
        var data = [["SL_NO", "Date", "Name_Of_Visitor", "Number_Of_Visitors", "Address", "Purpose", "To_Whom_Meet", "Scheduled_Time", "Time_In", "Time_Out", "Duration", "Mobile_No", "TransactionDate", "TransactionCreatedDate", "Status"]];
        results.forEach(row => {
            data.push([row["SL_NO"], row["Date"], row["Name_Of_Visitor"], row["Number_Of_Visitors"],
            row["Address"], row["Purpose"], row["To_Whom_Meet"], row["Scheduled_Time"], row["Time_In"],
            row["Time_Out"], row["Duration"], row["Mobile_No"], row["TransactionDate"], row["TransactionCreatedDate"], row["VisitorStatus"]]);
        });
        var worksheet = xlsx.utils.aoa_to_sheet(data),
            workbook = xlsx.utils.book_new();

        xlsx.utils.book_append_sheet(workbook, worksheet, "Visitors");
        const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

        res.setHeader('Content-Disposition', 'attachment; filename=visitors.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        res.status(200).send(excelBuffer);

        console.log('Excel file sent successfully.');
        notifier.notify({
            title: 'Salutations!',
            message: 'Visitor details downloaded',
            icon: path.join(__dirname, 'static', 'success.png'),
            sound: true,
            wait: true
        });
    } catch (error) {
        console.error('Error generating Excel file:', error);
        res.status(500).json({ message: 'Error generating Excel file' });
    }
});

// Conference room booking
// Get conference room bookings for the given date and room
app.get('/getConferenceBookings/:date/:room_no', async (req, res) => {
    var date = req.params.date;
    var room_no = req.params.room_no;
    date = new Date(date);
    date = date.toLocaleDateString();

    var query = `SELECT sl_no,location,meeting_start_time, meeting_end_time, name_of_person, room_no FROM Conference WHERE Date = ? and Room_No like ?`;

    try {
        const [bookings] = await pool.execute(query, [date, `%${room_no}%`]);
        res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).send('Error fetching bookings');
    }
});

// Book conference room for the given time and date 
app.post('/bookConferenceRoom', async (req, res) => {
    var current_date = new Date();
    var date_time = current_date.toLocaleDateString() + ' ' + current_date.toLocaleTimeString() + ' Created';
    var transactionDate = date_time;
    var transactionCreatedDate = date_time;
    var { name_of_person, date, room_no, hours_start, minutes_start, ampm_start, hours_end, minutes_end, ampm_end, userLocation, username } = req.body;
    date = new Date(date);
    date = date.toLocaleDateString();
    var meeting_start_time = hours_start + ":" + minutes_start + " " + ampm_start;
    var meeting_end_time = hours_end + ":" + minutes_end + " " + ampm_end;
    meeting_start_time = reverseTimeFormat(meeting_start_time);
    meeting_end_time = reverseTimeFormat(meeting_end_time);
    var query = `Select meeting_start_time,meeting_end_time from Conference where Date = '${date}' and Room_No = '${room_no}'`;
    const [times] = await pool.execute(query);
    for (const booking of times) {
        const start = reverseTimeFormat(booking.meeting_start_time);
        const end = reverseTimeFormat(booking.meeting_end_time);
        if ((stringToNum(meeting_start_time) <= stringToNum(start) && stringToNum(meeting_end_time) >= stringToNum(start)) ||
            (stringToNum(meeting_start_time) >= stringToNum(start) && stringToNum(meeting_end_time) <= stringToNum(end))
            || (stringToNum(meeting_start_time) <= stringToNum(end) && stringToNum(meeting_end_time) >= stringToNum(end))) {
            notifier.notify({
                title: 'Error Occurred!!',
                message: 'Conference room already booked for this time slot!!',
                icon: path.join(__dirname, 'static', 'warning.png'),
                sound: true,
                wait: true
            });
            return res.status(401).json({ message: 'Conference room already booked' });
        }
    }
    meeting_start_time = changeTimeFormat(meeting_start_time);
    meeting_end_time = changeTimeFormat(meeting_end_time);
    query = `
        INSERT INTO Conference (
            Name_of_person,Location,Date,Room_No,Meeting_Start_Time,Meeting_End_Time,TransactionDate,TransactionCreatedDate,TransactionCreatedBy
        ) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
        const [result] = await pool.execute(query, [
            name_of_person, userLocation, date, room_no, meeting_start_time, meeting_end_time,
            transactionDate, transactionCreatedDate, username
        ]);
        notifier.notify({
            title: 'Salutations!',
            message: 'Conference room booked successfully!!',
            icon: path.join(__dirname, 'static', 'conference-room.png'),
            sound: true,
            wait: true
        });
        res.status(200).json({ message: 'Conference room booked successfully' });
    } catch (error) {
        console.error('Error booking conference room:', error);
        notifier.notify({
            title: 'Error Occurred!!',
            message: 'Error Occurred while booking conference room!!',
            icon: path.join(__dirname, 'static', 'warning.png'),
            sound: true,
            wait: true
        });
        res.status(500).json({ message: 'Error Occurred' });
    }
});

// Update meeting info by passing parameters
app.post('/updateMeetingInfo', async (req, res) => {
    var sl_no = req.body.SL_NO;
    var checkQuery = `Select * from Conference  WHERE SL_NO = ?`;
    const [results] = await pool.execute(checkQuery, [sl_no]);
    if (results.length == 0) {
        notifier.notify({
            title: 'Error Occurred!!',
            message: 'Meeting Not Found!!',
            icon: path.join(__dirname, 'static', 'warning.png'),
            sound: true,
            wait: true
        });
        return res.status(400).json({ message: 'Meeting Not Found' });
    }
    var updateField = req.body.updateField;
    var updatedValue = req.body.updatedValue;
    var current_date = new Date();
    var date_time = current_date.toLocaleDateString() + ' ' + current_date.toLocaleTimeString() + ' Modified';

    if (updateField === 'date') {
        updatedValue = new Date(updatedValue).toLocaleDateString();
    }
    else if (updateField === 'meeting_start_time' || updateField === 'meeting_end_time') {
        var hours_time = req.body.hours_time;
        var minutes_time = req.body.minutes_time;
        var ampm_time = req.body.ampm_time;
        updatedValue = hours_time + ":" + minutes_time + " " + ampm_time;
    }

    var query = `Update Conference Set ${updateField} = ?,TransactionDate = ? WHERE SL_NO = ?`;

    try {
        let safeQuery = `SET SQL_SAFE_UPDATES=0`;
        await pool.execute(safeQuery);
        await pool.execute(query, [updatedValue, date_time, sl_no]);
        safeQuery = `SET SQL_SAFE_UPDATES=1`;
        await pool.execute(safeQuery);
        notifier.notify({
            title: 'Salutations!!',
            message: 'Conference updated successfully!!',
            icon: path.join(__dirname, 'static', 'visitor.png'),
            sound: true,
            wait: true
        });
        res.status(200).json({ message: 'Conference updated successfully' });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Error fetching bookings' });
    }
});

// Cancel meeting by sl_no
app.post('/cancelMeeting', async (req, res) => {
    var sl_no = req.body.SL_NO;
    var checkQuery = `Select * from Conference  WHERE SL_NO = ?`;
    const [results] = await pool.execute(checkQuery, [sl_no]);
    if (results.length == 0) {
        notifier.notify({
            title: 'Error Occurred!!',
            message: 'Meeting Not Found!!',
            icon: path.join(__dirname, 'static', 'warning.png'),
            sound: true,
            wait: true
        });
        return res.status(400).json({ message: 'Meeting not found' });
    }
    var query = `Delete from Conference  WHERE SL_NO = ?`;

    try {
        let safeQuery = `SET SQL_SAFE_UPDATES=0`;
        await pool.execute(safeQuery);
        await pool.execute(query, [sl_no]);
        safeQuery = `SET SQL_SAFE_UPDATES=1`;
        await pool.execute(safeQuery);
        notifier.notify({
            title: 'Salutations!!',
            message: 'Meeting cancelled successfully!!',
            icon: path.join(__dirname, 'static', 'delete.png'),
            sound: true,
            wait: true
        });
        res.status(200).json({ message: 'Meeting cancelled successfully' });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).send('Error fetching bookings');
    }
});

// Reception portal pdf containing detailed info about working of the reception-portal
app.get('/download/Reception-Portal-Pdf', async (req, res) => {
    const filePath = path.join(__dirname, 'static', 'Reception_Portal_PPT.pdf'); // Adjust path as needed
    res.download(filePath, 'Reception_Portal_PPT.pdf', (err) => {
        if (err) {
            console.error('Error during file download:', err);
        }
    });
});

// Start server on the given port
const startServer = () => {
    app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
};

// Restart the server if some error occurs
// Error handling
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception: ', err);
    restartApp();
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    restartApp();
});
// Restart app every 1s
function restartApp() {
    console.log("Restarting application...");
    setTimeout(() => {
        process.exit(1);
    }, 1000);
}
// Start the server
startServer();


