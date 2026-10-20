// Textos legales portados de index.html (función legal()). Completar los placeholders antes de producción.
const EMP = "[RAZÓN SOCIAL] (CUIT [XX-XXXXXXXX-X])";
const DOM = "[DOMICILIO LEGAL]";
const MAIL = "[EMAIL DE CONTACTO]";
const RNBD = "[N° DE INSCRIPCIÓN EN EL RNBD]";
const RET = "[PLAZO DE CONSERVACIÓN, definido con tu abogado]";
const HOST = "[PROVEEDOR Y PAÍS DE HOSTING DE LA BASE DE DATOS]";

export const PRIVACY_HTML = `<h2>Política de privacidad</h2><p>Última actualización: octubre de 2026.</p>
<h4>1. Responsable de la base de datos</h4><p>${EMP}, con domicilio en ${DOM}. Contacto: ${MAIL}. La base de datos está inscripta en el Registro Nacional de Bases de Datos Personales de la Agencia de Acceso a la Información Pública (AAIP) bajo el N° ${RNBD}, conforme los arts. 3, 21 y 22 de la Ley 25.326.</p>
<h4>2. Datos que recolectamos</h4><p>Nombre y apellido, DNI o legajo, edificio o escuela elegido, fecha y hora de ingreso y salida, y la ubicación geográfica (latitud, longitud y precisión) del dispositivo <b>únicamente en el instante en que fichás</b>. No hacemos seguimiento continuo ni recolectamos datos sensibles en los términos del art. 7 de la Ley 25.326. También tratamos el email con el que iniciás sesión. En tu dispositivo se guardan (localStorage) tu nombre, DNI y último lugar elegido para agilizar el formulario; podés borrarlos desde los ajustes de tu navegador.</p>
<h4>3. Finalidad</h4><p>Verificar la presencia en el lugar de trabajo, controlar la asistencia y horas trabajadas, y notificar al responsable a cargo. Los datos no se usan para otros fines incompatibles (art. 4).</p>
<h4>4. Consentimiento</h4><p>Este sistema de control de asistencia fue puesto en tu conocimiento previamente (art. 71 de la Ley de Contrato de Trabajo). Al marcar la casilla confirmás que fuiste informado/a sobre qué datos se tratan, para qué y quién es el responsable, y aceptás ese tratamiento (arts. 5 y 6 de la Ley 25.326). Podés negarte, pero sin ubicación no es posible fichar desde la app y deberá acordarse otro método de registro con tu empleador.</p>
<h4>5. Tus derechos</h4><p>Podés acceder a tus datos en forma gratuita a intervalos no inferiores a seis meses, y solicitar su rectificación, actualización o supresión (arts. 14 a 16), escribiendo a ${MAIL}. Responderemos en los plazos legales (10 días corridos para acceso; 5 días hábiles para rectificación o supresión).</p>
<h4>6. Órgano de control</h4><p>La AAIP, en su carácter de Órgano de Control de la Ley 25.326, tiene la atribución de atender las denuncias y reclamos que se interpongan con relación al incumplimiento de las normas sobre protección de datos personales.</p>
<h4>7. Seguridad y confidencialidad</h4><p>Aplicamos medidas técnicas y organizativas para evitar la adulteración, pérdida, consulta o tratamiento no autorizado de los datos (art. 9), incluyendo conexión cifrada (HTTPS), cuentas individuales con contraseña, control de acceso en el servidor (cada empleado solo ve sus propios registros; solo los administradores ven los de todos), validación de hora y lugar en el servidor y registros no modificables desde la aplicación. Quienes accedan a los datos están obligados al deber de confidencialidad (art. 10).</p>
<h4>8. Cesión y transferencia internacional</h4><p>No cedemos tus datos a terceros salvo obligación legal. Para operar el servicio usamos proveedores que actúan como encargados del tratamiento: ${HOST}. Cuando los datos se almacenan o procesan en un país sin nivel de protección adecuado según la normativa de la AAIP, la transferencia se ampara en cláusulas contractuales modelo aprobadas por la AAIP u otra garantía válida (art. 12 de la Ley 25.326, Disposición 60-E/2016 y Resolución AAIP 198/2023).</p>
<h4>9. Conservación</h4><p>Conservamos los registros durante ${RET}; vencido ese plazo se suprimen o disocian.</p>
<h4>10. Cambios</h4><p>Podemos actualizar esta política; la versión vigente estará siempre en esta página.</p>`;

export const TERMS_HTML = `<h2>Términos y condiciones</h2><p>Última actualización: octubre de 2026.</p>
<h4>1. Objeto</h4><p>MANTEN LIMPIO es una herramienta de registro de ingreso y salida para el personal de ${EMP}.</p>
<h4>2. Uso por el personal</h4><p>Cada persona debe registrar sus propios datos reales y fichar solamente cuando se encuentre físicamente en el edificio o escuela. Está prohibido fichar por otra persona, falsear la ubicación o la hora, o usar herramientas para simular el GPS. Estas conductas pueden dar lugar a las medidas disciplinarias previstas en la ley laboral.</p>
<h4>3. Ubicación y hora</h4><p>La app toma la ubicación y la hora del dispositivo al fichar para validar la presencia. La precisión depende del GPS y de la señal disponible.</p>
<h4>4. Administradores</h4><p>Solo el personal autorizado puede ver el panel de control y debe usar la información únicamente para la gestión del servicio, respetando la dignidad de las personas.</p>
<h4>5. Disponibilidad</h4><p>Hacemos lo posible por mantener el servicio activo, sin garantizar disponibilidad ininterrumpida. Ante fallas, el registro se acordará por otro medio.</p>
<h4>6. Ley aplicable</h4><p>Estos términos se rigen por las leyes de la República Argentina. Para cualquier controversia serán competentes los tribunales ordinarios de ${DOM}.</p>`;

export type LegalKind = "p" | "t";
export const legalHtml = (k: LegalKind) => (k === "p" ? PRIVACY_HTML : TERMS_HTML);
