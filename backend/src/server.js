const app = require('./app')
const connectDB = require('./data_base/dbSetup.js')
connectDB()

app.listen('3333',()=>{
    console.log('Server is running')
})