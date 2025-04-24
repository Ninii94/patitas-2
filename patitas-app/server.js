import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import multer from 'multer';
import bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import axios from 'axios';
import { existsSync } from 'fs';

// Configuración básica
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración de middleware
const upload = multer({ dest: 'uploads/' });
app.use(cors());
app.use(express.json());

// Configuración de la base de datos
const pool = mysql.createPool({
  host: process.env.RDS_HOSTNAME,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_DB_NAME,
  port: process.env.RDS_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();

// Verificación de configuración
console.log("Configuración de conexión a la base de datos:");
console.log(`Host: ${process.env.RDS_HOSTNAME}`);
console.log(`Usuario: ${process.env.RDS_USERNAME}`);
console.log(`Base de datos: ${process.env.RDS_DB_NAME}`);
console.log(`Puerto: ${process.env.RDS_PORT}`);
// Configuración de Cloudinary
cloudinary.config({
  cloud_name: 'dukljwnwm',
  api_key: '233217234563179',
  api_secret: 'drzuhhOtMfVoeD4ANeEK3Z0S6nE'
});
// ============= RUTAS DE AUTENTICACIÓN =============
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM usuario_administrador WHERE nombre_usuario = ?',
      [username]
    );
    if (rows.length > 0) {
      const user = rows[0];
      const match = await bcrypt.compare(password, user.contrasena);
      if (match) {
        res.json({ success: true, role: 'admin' });
      } else {
        res.status(401).json({ success: false, message: 'Credenciales inválidas' });
      }
    } else {
      res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.post('/api/verificar-password', async (req, res) => {
  const { codRefugio, password } = req.body;
  try {
    if (!codRefugio || !password) {
      return res.status(400).json({
        error: 'Se requieren código de refugio y contraseña'
      });
    }
    const [rows] = await pool.execute(
      'SELECT cod_refugio, password FROM refugios WHERE cod_refugio = ? AND password = ?',
      [codRefugio, password]
    );
    const verified = rows.length > 0;
    res.json({ 
      verified,
      message: verified ? 'Credenciales válidas' : 'Credenciales inválidas',
      refugio: verified ? rows[0].cod_refugio : null
    });
  } catch (error) {
    console.error('Error al verificar la contraseña:', error);
    res.status(500).json({
      error: 'Error al verificar la contraseña',
      details: error.message
    });
  }
});

// ============= RUTAS DE MASCOTAS =============
// Obtener mascotas recientes
app.get('/api/mascotas/recientes', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        md.id, 
        md.nombre, 
        md.imagen_url,
        e.descripcion AS estado
      FROM Mascotas_Disponibles md
      LEFT JOIN estado e ON md.id_estado = e.id_estado
      WHERE md.id_estado = 1
      ORDER BY md.id DESC
      LIMIT 10
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener mascotas recientes:', error);
    res.status(500).json({ message: 'Error al obtener mascotas recientes', error: error.message });
  }
});

// Obtener mascotas adoptadas
app.get('/api/mascotas/adoptadas', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        md.id,
        md.nombre,
        md.especie,
        md.edad,
        md.sexo,
        md.descripcion,
        md.numero_contacto,
        md.cod_refugio,
        md.imagen_url,
        md.fecha_adopcion,
        e.descripcion AS estado,
        r.nombre AS nombre_refugio
      FROM Mascotas_Disponibles md
      LEFT JOIN refugios r ON md.cod_refugio = r.cod_refugio
      LEFT JOIN estado e ON md.id_estado = e.id_estado
      WHERE md.id_estado = 3
      ORDER BY md.id DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener mascotas adoptadas:', error);
    res.status(500).json({
      message: 'Error al obtener mascotas adoptadas',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});
// Obtener todas las mascotas disponibles
app.get('/api/mascotas', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        md.id, 
        md.nombre, 
        md.especie, 
        md.edad, 
        md.sexo, 
        md.descripcion, 
        md.numero_contacto, 
        md.cod_refugio,
        md.imagen_url,
        e.descripcion AS estado,
        r.nombre AS nombre_refugio
      FROM Mascotas_Disponibles md
      LEFT JOIN refugios r ON md.cod_refugio = r.cod_refugio
      LEFT JOIN estado e ON md.id_estado = e.id_estado
      WHERE md.id_estado = 1
      ORDER BY md.id DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener mascotas:', error);
    res.status(500).json({ message: 'Error al obtener mascotas', error: error.message });
  }
});
//obtener todas las mascotas y su estado
app.get('/api/mascotas/estado', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        md.id, 
        md.nombre, 
        md.especie, 
        md.edad, 
        md.sexo, 
        md.descripcion, 
        md.numero_contacto, 
        md.cod_refugio,
        md.imagen_url,
        md.fecha_subida,
        md.fecha_adopcion,
        md.fecha_devolucion,
        md.motivo_devolucion,
        e.descripcion AS estado,
        r.nombre AS nombre_refugio
      FROM Mascotas_Disponibles md
      LEFT JOIN refugios r ON md.cod_refugio = r.cod_refugio
      LEFT JOIN estado e ON md.id_estado = e.id_estado
      ORDER BY md.id DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener mascotas:', error);
    res.status(500).json({ message: 'Error al obtener mascotas', error: error.message });
  }
});
// Obtener mascotas inactivas 
app.get('/api/mascotas/desactivar', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        md.id, 
        md.nombre, 
        md.especie, 
        md.edad, 
        md.sexo, 
        md.descripcion, 
        md.numero_contacto, 
        md.cod_refugio,
        md.imagen_url,
        e.descripcion AS estado,
        r.nombre AS nombre_refugio
      FROM Mascotas_Disponibles md
      LEFT JOIN refugios r ON md.cod_refugio = r.cod_refugio
      LEFT JOIN estado e ON md.id_estado = e.id_estado
      WHERE md.id_estado = 2
      ORDER BY md.id DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener mascotas:', error);
    res.status(500).json({ message: 'Error al obtener mascotas', error: error.message });
  }
});
// Obtener mascota por ID
app.get('/api/mascotas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT 
        md.*,
        e.descripcion AS estado
      FROM Mascotas_Disponibles md
      LEFT JOIN estado e ON md.id_estado = e.id_estado
      WHERE md.id = ?
    `, [id]);
    
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Mascota no encontrada' });
    }
  } catch (error) {
    console.error('Error al obtener mascota por ID:', error);
    res.status(500).json({ message: 'Error al obtener mascota', error: error.message });
  }
});
//Subir mascota 
app.post('/api/mascotas', async (req, res) => {
  try {
      const {
          nombre,
          especie,
          edad,
          sexo,
          descripcion,
          numero_contacto,
          cod_refugio,
          imagen_url
      } = req.body;

      // Validaciones básicas
      if (!nombre || !especie || !edad || !sexo || !numero_contacto || !cod_refugio) {
          return res.status(400).json({
              success: false,
              message: "Todos los campos obligatorios deben ser proporcionados"
          });
      }

      // Insertar la nueva mascota usando sintaxis MySQL
      const query = `
          INSERT INTO Mascotas_Disponibles 
          (nombre, especie, edad, sexo, descripcion, numero_contacto, 
           cod_refugio, imagen_url, fecha_subida, id_estado) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
      `;

      const [result] = await pool.query(query, 
          [nombre, especie, edad, sexo, descripcion, numero_contacto, 
           cod_refugio, imagen_url, 1]
      );

      // Obtener la mascota recién insertada
      const [newPet] = await pool.query(
          'SELECT * FROM Mascotas_Disponibles WHERE id = ?',
          [result.insertId]
      );

      res.status(201).json({
          success: true,
          message: "Mascota agregada exitosamente",
          data: newPet[0]
      });

  } catch (err) {
      console.error(err.message);
      res.status(500).json({
          success: false,
          message: "Error al agregar la mascota",
          error: err.message
      });
  }
});
// Actualizar mascota por ID
app.put('/api/mascotas/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    nombre, 
    especie, 
    edad, 
    sexo, 
    descripcion, 
    numero_contacto, 
    cod_refugio, 
    imagen_url 
  } = req.body;
  
  try {
    // Verificar que la mascota existe antes de actualizar
    const [checkRows] = await pool.query(
      'SELECT id FROM Mascotas_Disponibles WHERE id = ?',
      [id]
    );
    
    if (checkRows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Mascota no encontrada' 
      });
    }
    
    const [result] = await pool.query(
      `UPDATE Mascotas_Disponibles 
       SET nombre = ?, 
           especie = ?, 
           edad = ?, 
           sexo = ?, 
           descripcion = ?, 
           numero_contacto = ?, 
           cod_refugio = ?, 
           imagen_url = ?
       WHERE id = ?`,
      [nombre, especie, edad, sexo, descripcion, numero_contacto, cod_refugio, imagen_url, id]
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ 
        success: false,
        message: 'Error al actualizar la mascota' 
      });
    }
    
    // Obtener la mascota actualizada
    const [updatedPet] = await pool.query(
      'SELECT * FROM Mascotas_Disponibles WHERE id = ?',
      [id]
    );

    res.json({ 
      success: true,
      message: 'Mascota actualizada correctamente',
      data: updatedPet[0]
    });
  } catch (error) {
    console.error('Error al actualizar mascota:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al actualizar la mascota', 
      error: error.message 
    });
  }
});

// Adoptar mascota
app.put('/api/mascotas/:id/adoptar', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      `UPDATE Mascotas_Disponibles 
       SET id_estado = 3,
       fecha_adopcion = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Mascota no encontrada' });
    } else {
      res.json({ 
        message: 'Estado de mascota actualizado a adoptado correctamente',
        id_estado: 3
      });
    }
  } catch (error) {
    console.error('Error al actualizar estado de mascota:', error);
    res.status(500).json({ message: 'Error al actualizar estado de mascota', error: error.message });
  }
});
// Desactivar mascota
app.put('/api/mascotas/:id/desactivar', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      `UPDATE Mascotas_Disponibles 
       SET id_estado = 2
       WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Mascota no encontrada' });
    } else {
      res.json({ 
        message: 'Estado de mascota actualizado a adoptado correctamente',
        id_estado: 2
      });
    }
  } catch (error) {
    console.error('Error al actualizar estado de mascota:', error);
    res.status(500).json({ message: 'Error al actualizar estado de mascota', error: error.message });
  }
});
// Devolver mascota
app.put('/api/mascotas/:id/devolver', async (req, res) => {
  const { id } = req.params;
  const { motivo_devolucion } = req.body;
  const fecha_devolucion = new Date().toISOString().split('T')[0];

  if (!motivo_devolucion) {
    return res.status(400).json({
      error: 'El motivo de devolución es requerido'
    });
  }

  let connection;
  
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Actualizar el estado a 1 (disponible) y agregar la información de devolución
    await connection.execute(
      `UPDATE Mascotas_Disponibles 
       SET id_estado = 1,
           motivo_devolucion = ?,
           fecha_devolucion = ?
       WHERE id = ?`,
      [motivo_devolucion, fecha_devolucion, id]
    );

    await connection.commit();
    res.json({ 
      success: true, 
      message: 'Mascota marcada como disponible exitosamente' 
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error al procesar la devolución:', error);
    res.status(500).json({
      error: 'Error al procesar la devolución',
      details: error.message
    });
  } finally {
    if (connection) connection.release();
  }
});
// Reactivar mascota
app.put('/api/mascotas/:id/reactivar', async (req, res) => {
  const { id } = req.params;
  const { fecha_subida } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE Mascotas_Disponibles 
       SET id_estado = 1,
           fecha_subida = ?
       WHERE id = ?`,
      [fecha_subida, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Mascota no encontrada' });
    } else {
      res.json({ 
        message: 'Mascota reactivada correctamente',
        id_estado: 1
      });
    }
  } catch (error) {
    console.error('Error al reactivar mascota:', error);
    res.status(500).json({ message: 'Error al reactivar mascota', error: error.message });
  }
});

// ============= RUTAS DE REFUGIOS =============
app.get('/api/refugios/codigos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT cod_refugio, nombre FROM refugios ORDER BY cod_refugio;');
    const codigos = rows.map(row => row.cod_refugio);
    res.json(codigos);
  } catch (error) {
    console.error('Error al obtener códigos de refugio:', error);
    res.status(500).json({ message: 'Error al obtener códigos de refugio', error: error.message });
  }
});

// ============= RUTAS DE ESTADÍSTICAS =============
// Nuevos animales del último mes
app.get('/api/new-pets', async (req, res) => {
  const { refugio } = req.query;
  try {
    let query = `
      SELECT 
        COALESCE(especie, 'No especificada') as especie,
        COUNT(*) as cantidad
      FROM Mascotas_Disponibles
      WHERE fecha_subida >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
    `;

    const params = [];
    if (refugio) {
      query += ` AND cod_refugio = ?`;
      params.push(refugio);
    }

    query += ` GROUP BY especie ORDER BY cantidad DESC`;

    const [rows] = await pool.execute(query, params);

    const totales = {
      total: 0,
      porEspecie: {
        Canina: 0,
        Felina: 0
      }
    };

   
    rows.forEach(row => {
      totales.total += Number(row.cantidad);
      if (row.especie === 'Canina') {
        totales.porEspecie.Canina = Number(row.cantidad);
      } else if (row.especie === 'Felina') {
        totales.porEspecie.Felina = Number(row.cantidad);
      }
    });

    if (rows.length === 0) {
      return res.json({
        data: [
          { especie: 'Canina', cantidad: 0 },
          { especie: 'Felina', cantidad: 0 }
        ],
        totales
      });
    }

    res.json({
      data: rows,
      totales
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de nuevas mascotas:', error);
    res.status(500).json({ 
      error: 'Error al obtener estadísticas',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// Tiempo hasta adopción
app.get('/api/adoption-time', async (req, res) => {
  const { refugio } = req.query;
  try {
    // Primero, obtener los datos sin agrupar para verificar
    let verificationQuery = `
      SELECT 
        fecha_adopcion,
        fecha_subida,
        especie,
        DATEDIFF(fecha_adopcion, fecha_subida) as dias_hasta_adopcion
      FROM Mascotas_Disponibles
      WHERE fecha_adopcion IS NOT NULL 
        AND fecha_subida IS NOT NULL
        AND id_estado = 3
        ${refugio ? 'AND cod_refugio = ?' : ''}
      ORDER BY fecha_adopcion DESC
      LIMIT 10;
    `;
    
    const [verificationRows] = await pool.execute(
      verificationQuery, 
      refugio ? [refugio] : []
    );
    console.log('Verification data:', verificationRows);

    // Consulta principal modificada para asegurar que captura todos los datos
    let query = `
      SELECT 
        CASE
          WHEN DATEDIFF(fecha_adopcion, fecha_subida) <= 7 THEN '1 semana o menos'
          WHEN DATEDIFF(fecha_adopcion, fecha_subida) <= 30 THEN '1 mes o menos'
          WHEN DATEDIFF(fecha_adopcion, fecha_subida) <= 90 THEN '3 meses o menos'
          ELSE 'Más de 3 meses'
        END as rango,
        especie,
        COUNT(*) as cantidad
      FROM Mascotas_Disponibles
      WHERE fecha_adopcion IS NOT NULL 
        AND fecha_subida IS NOT NULL
        AND id_estado = 3
        ${refugio ? 'AND cod_refugio = ?' : ''}
      GROUP BY 
        CASE
          WHEN DATEDIFF(fecha_adopcion, fecha_subida) <= 7 THEN '1 semana o menos'
          WHEN DATEDIFF(fecha_adopcion, fecha_subida) <= 30 THEN '1 mes o menos'
          WHEN DATEDIFF(fecha_adopcion, fecha_subida) <= 90 THEN '3 meses o menos'
          ELSE 'Más de 3 meses'
        END,
        especie
      ORDER BY 
        CASE rango
          WHEN '1 semana o menos' THEN 1
          WHEN '1 mes o menos' THEN 2
          WHEN '3 meses o menos' THEN 3
          ELSE 4
        END;
    `;

    const [rows] = await pool.execute(
      query, 
      refugio ? [refugio] : []
    );
    
    console.log('Raw query results:', rows);

    const rangos = [
      '1 semana o menos',
      '1 mes o menos',
      '3 meses o menos',
      'Más de 3 meses'
    ];

    // Inicializar estructura de datos con todos los rangos
    const dataProcesada = rangos.map(rango => ({
      rango,
      cantidad: 0,
      Canina: 0,
      Felina: 0
    }));

    // Procesar los resultados
    rows.forEach(row => {
      const datoRango = dataProcesada.find(d => d.rango === row.rango);
      if (datoRango) {
        const cantidad = Number(row.cantidad);
        datoRango.cantidad += cantidad;
        
        // Asignar específicamente a Canina o Felina
        if (row.especie === 'Canina') {
          datoRango.Canina = cantidad;
        } else if (row.especie === 'Felina') {
          datoRango.Felina = cantidad;
        }
      }
    });

    // Calcular totales
    const totales = {
      total: 0,
      porEspecie: {
        Canina: 0,
        Felina: 0
      }
    };

    dataProcesada.forEach(dato => {
      totales.total += dato.Canina + dato.Felina;
      totales.porEspecie.Canina += dato.Canina;
      totales.porEspecie.Felina += dato.Felina;
    });

    console.log('Processed data:', {
      data: dataProcesada,
      totales
    });

    res.json({
      data: dataProcesada,
      totales
    });
  } catch (error) {
    console.error('Error al obtener tiempos de adopción:', error);
    res.status(500).json({ 
      error: 'Error al obtener estadísticas',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

// devoluciones

app.get('/api/return-reasons', async (req, res) => {
  const { refugio, especie } = req.query;
  try {
    let totalQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN especie = 'Canina' THEN 1 ELSE 0 END) as total_caninos,
        SUM(CASE WHEN especie = 'Felina' THEN 1 ELSE 0 END) as total_felinos
      FROM Mascotas_Disponibles
      WHERE fecha_devolucion IS NOT NULL 
      AND motivo_devolucion IS NOT NULL
    `;

    const totalParams = [];
    if (refugio) {
      totalQuery += ` AND cod_refugio = ?`;
      totalParams.push(refugio);
    }

    let query = `
      SELECT 
        COALESCE(motivo_devolucion, 'Sin especificar') as motivo,
        COUNT(*) as cantidad,
        especie,
        COUNT(*) * 100.0 / (
          SELECT COUNT(*) 
          FROM Mascotas_Disponibles sub
          WHERE sub.fecha_devolucion IS NOT NULL 
          AND sub.motivo_devolucion IS NOT NULL
          AND sub.especie = Mascotas_Disponibles.especie
          ${refugio ? ' AND sub.cod_refugio = ?' : ''}
        ) as porcentaje
      FROM Mascotas_Disponibles
      WHERE fecha_devolucion IS NOT NULL 
      AND motivo_devolucion IS NOT NULL
    `;

    const params = [];
    if (refugio) {
      query += ` AND cod_refugio = ?`;
      params.push(refugio);
      params.push(refugio); 
    }
    if (especie && especie !== 'todos') {
      query += ` AND especie = ?`;
      params.push(especie);
    }

    query += ` GROUP BY motivo_devolucion, especie ORDER BY cantidad DESC`;

    console.log('Query:', query); 
    console.log('Params:', params); 

  
    const [[totalesRow]] = await pool.execute(totalQuery, totalParams);
    const [rows] = await pool.execute(query, params);

    console.log('Totales:', totalesRow); 
    console.log('Rows:', rows); 

    // Calcular totales generales
    const totales = {
      total: Number(totalesRow.total || 0),
      porEspecie: {
        Canina: Number(totalesRow.total_caninos || 0),
        Felina: Number(totalesRow.total_felinos || 0)
      }
    };

    // Procesar los datos
    let motivosProcesados;
    if (!especie || especie === 'todos') {
      // vista general:
      const motivosAgrupados = {};
      rows.forEach(row => {
        const cantidad = Number(row.cantidad);
        if (!motivosAgrupados[row.motivo]) {
          motivosAgrupados[row.motivo] = {
            motivo: row.motivo,
            cantidad: 0,
            porcentaje: 0,
            porEspecie: {
              Canina: 0,
              Felina: 0
            }
          };
        }
        motivosAgrupados[row.motivo].cantidad += cantidad;
        
        // Calcular porcentaje
        if (totales.total > 0) {
          motivosAgrupados[row.motivo].porcentaje = 
            (motivosAgrupados[row.motivo].cantidad * 100 / totales.total).toFixed(2);
        }
        
        if (row.especie === 'Canina') {
          motivosAgrupados[row.motivo].porEspecie.Canina += cantidad;
        } else if (row.especie === 'Felina') {
          motivosAgrupados[row.motivo].porEspecie.Felina += cantidad;
        }
      });
      motivosProcesados = Object.values(motivosAgrupados);
    } else {
      // vista específica por especie
      const totalEspecie = especie === 'Canina' ? totales.porEspecie.Canina : totales.porEspecie.Felina;
      motivosProcesados = rows.map(row => ({
        motivo: row.motivo,
        cantidad: Number(row.cantidad),
        porcentaje: totalEspecie > 0 ? ((row.cantidad * 100) / totalEspecie).toFixed(2) : "0.00",
        especie: row.especie
      }));
    }

    // Si no hay datos
    if (!rows.length) {
      return res.json({
        data: [{
          motivo: 'Sin devoluciones',
          cantidad: 0,
          porcentaje: 0,
          porEspecie: {
            Canina: 0,
            Felina: 0
          }
        }],
        totales: {
          total: 0,
          porEspecie: {
            Canina: 0,
            Felina: 0
          }
        }
      });
    }
    motivosProcesados.sort((a, b) => b.cantidad - a.cantidad);

    const response = {
      data: motivosProcesados,
      totales
    };

    console.log('Response:', JSON.stringify(response, null, 2)); // Para debugging

    res.json(response);

  } catch (error) {
    console.error('Error al obtener razones de devolución:', error);
    res.status(500).json({ 
      error: 'Error al obtener estadísticas',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});



// ============= RUTA DE PRUEBA =============
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});
// sirve el frontend
const distPath = join(__dirname, 'dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  
  app.get('*', (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
}


// ============= MANEJO DE ERRORES =============
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo salió mal!' });
});
// Verificar conexión a la base de datos
pool.query('SELECT 1')
  .then(() => {
    console.log('Conexión a la base de datos establecida correctamente');
  })
  .catch(err => {
    console.error('Error al conectar a la base de datos:', err);
  });

// ============= INICIAR SERVIDOR =============
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

export { app, pool, upload, cloudinary };