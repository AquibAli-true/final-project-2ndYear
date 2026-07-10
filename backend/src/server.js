const app = require('./App')
const connectDB = require('./data_base/dbSetup.js')
connectDB()

app.listen('3333',()=>{
    console.log('Server is running')
})