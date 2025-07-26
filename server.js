const express = require('express');
const fs = require('fs').promises; // Use promises version
const path = require('path');

const server = express();
const PORT = 3001;

const userRouter = express.Router();
const coursesRouter = express.Router();

server.use(express.urlencoded({ extended: true }));
server.use(express.json({ extended: true }));
server.use('/assets', express.static('public'));

// File path for courses data
const COURSES_FILE_PATH = path.join(__dirname, 'data', 'courses.json');

// Validation middleware
function courseValidation(req, res, next) {
    if(!req.body.name || !req.body.duration || !req.body.instructor) {
        return res.status(400).send({message: `All fields are required`});
    }
    next();
}

// Ensure data directory exists
async function initializeData() {
    try {
        await fs.mkdir(path.dirname(COURSES_FILE_PATH), { recursive: true });
        try {
            await fs.access(COURSES_FILE_PATH);
        } catch {
            await fs.writeFile(COURSES_FILE_PATH, '[]', 'utf8');
        }
    } catch (err) {
        console.error('Failed to initialize data:', err);
    }
}

initializeData();

// Helper function to read/write courses
async function getCourses() {
    const data = await fs.readFile(COURSES_FILE_PATH, 'utf-8');
    return JSON.stringify(data);
}

async function saveCourses(courses) {
    await fs.writeFile(COURSES_FILE_PATH, JSON.stringify(courses, null, 2), 'utf8');
}

server.get('/', (req, res) => {
    res.send(`Dashboard`);
});

userRouter
    .use((req, res, next) => {
        console.log(`>>>>>> My middleware Users`);
        next();
    })
    .get('/', (req, res) => {
        res.send(`All Users`);
    })
    .post('/', (req, res) => {
        res.send(`Create User`);
    })
    .put('/:id', (req, res) => {
        res.send(`User Updated >> ${req.params.id}`);
    })
    .delete('/:id', (req, res) => {
        res.send(`User Deleted >> ${req.params.id}`);
    });

coursesRouter
    .use((req, res, next) => {
        console.log(`>>>>>> My middleware Courses`);
        next();
    })
    .get('/', async (req, res) => {
        try {
            const courses = await getCourses();
            res.json(courses);
        } catch (err) {
            res.status(500).send('Error reading courses');
        }
    })
    .post('/', courseValidation, async (req, res) => {
        try {
            const courses = await getCourses();
            const course = {
                id: Date.now(), // Using timestamp as ID
                name: req.body.name,
                duration: req.body.duration,
                instructor: req.body.instructor,
                created_at: new Date().toISOString()
            };
            
            courses.push(course);
            await saveCourses(courses);
            
            res.status(201).send({
                message: 'Course Created Successfully',
                data: course
            });
        } catch (err) {
            console.error(err);
            res.status(500).send('Error creating course');
        }
    })
    .put('/:id', async (req, res) => {
        try {
            let courses = await getCourses();
            const courseIndex = courses.findIndex(c => c.id === parseInt(req.params.id));
            
            if (courseIndex === -1) {
                return res.status(404).send('Course not found');
            }
            
            courses[courseIndex] = {
                ...courses[courseIndex],
                ...req.body,
                updated_at: new Date().toISOString()
            };
            
            await saveCourses(courses);
            res.send({
                message: `Course Updated >> ${req.params.id}`,
                data: courses[courseIndex]
            });
        } catch (err) {
            res.status(500).send('Error updating course');
        }
    })
    .delete('/:id', async (req, res) => {
        try {
            let courses = await getCourses();
            const courseIndex = courses.findIndex(c => c.id === parseInt(req.params.id));
            
            if (courseIndex === -1) {
                return res.status(404).send('Course not found');
            }
            
            const [deletedCourse] = courses.splice(courseIndex, 1);
            await saveCourses(courses);
            
            res.send({
                message: `Course Deleted >> ${req.params.id}`,
                data: deletedCourse
            });
        } catch (err) {
            res.status(500).send('Error deleting course');
        }
    });

server.use('/users', userRouter);
server.use('/courses', coursesRouter);

server.listen(PORT, () => console.log(`Server Started PORT: ${PORT}`));