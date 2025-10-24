import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('Intentando conectar a MongoDB...');
console.log('URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Conexión exitosa a MongoDB!');
    console.log('Host:', mongoose.connection.host);
    console.log('Base de datos:', mongoose.connection.name);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error de conexión:');
    console.error('Mensaje:', error.message);
    console.error('Código:', error.code);
    console.error('\nPosibles soluciones:');
    console.error('1. Verifica que MongoDB esté corriendo');
    console.error('2. Verifica el usuario y contraseña');
    console.error('3. Intenta: mongodb://admin:admin@localhost:27017/financial-sec?authSource=admin');
    console.error('4. O sin autenticación: mongodb://localhost:27017/financial-sec');
    process.exit(1);
  });
