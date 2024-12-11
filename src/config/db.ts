import moongose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: 'variables.env' });



const connectDB =async() => {
    try {    
    const dataBaseConnection = process.env.DATABASE;
     console.log(dataBaseConnection);
     await moongose.connect(dataBaseConnection!);
     console.log('la conexion a la base de datos fue un exito');
    } catch (error) {
        console.log(`la conexion fallo ${error}`);
    }
} 

export {
    connectDB,
}
