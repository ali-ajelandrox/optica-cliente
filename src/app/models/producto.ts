// Definir la interfaz Producto
export interface Producto {
  _id?: number;
  vendedor: string;
  nombre: string;
  rut: string;
  telefono: string;
  precio: number;
  abono: number;
  saldo: number;
  fecha: Date;
  observacion: string;
  tipoPago: string;
  tablas: any[10]; // O ajusta el tipo según la estructura de tus datos de tabla
  odEsferico?: string;
  odCilindro?: string;
  odEje?: string;
  odAdicion?: string;
  odDp?: string;
  osEsferico?: string;
  osCilindro?: string;
  osEje?: string;
  osAdicion?: string;
  osDp?: string;
}


