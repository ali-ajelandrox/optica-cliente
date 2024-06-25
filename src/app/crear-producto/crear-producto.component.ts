import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProductoService } from '../services/producto.ts.service.js';
import { Producto } from '../models/producto';
import jsPDF from 'jspdf'; // Importar jsPDF como un default import
import html2canvas from 'html2canvas'; // Importar html2canvas

@Component({
  selector: 'app-crear-producto',
  templateUrl: './crear-producto.component.html',
  styleUrls: ['./crear-producto.component.css']
})
export class CrearProductoComponent implements OnInit {
  productoForm: FormGroup;
  titulo = "Nueva Venta";
  id: string | null;
  from: string | null;
  tablas: FormArray;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastrService: ToastrService,
    private productoService: ProductoService,
    private aRouter: ActivatedRoute
  ) {
    this.tablas = this.fb.array([
      this.crearTabla() // Dejar una tabla por defecto al crear el formulario
    ]);

    this.productoForm = this.fb.group({
      vendedor: ['', Validators.required],
      nombre: ['', Validators.required],
      rut: ['', Validators.required],
      telefono: ['', Validators.required],
      precio: ['', Validators.required],
      abono: ['', Validators.required],
      saldo: [''],
      fecha: ['', Validators.required],
      observacion: ['', Validators.required],
      tipoPago: ['', Validators.required],
      tablas: this.tablas
    });

    this.id = this.aRouter.snapshot.paramMap.get('id');
    this.from = this.aRouter.snapshot.queryParamMap.get('from');
  }

  ngOnInit(): void {
    if (this.id !== null) {
      this.esEditar();
    }

    this.productoForm.get('precio')?.valueChanges.subscribe(() => {
      this.actualizarSaldo();
    });

    this.productoForm.get('abono')?.valueChanges.subscribe(() => {
      this.actualizarSaldo();
    });
  }

  esEditar() {
    this.titulo = 'Editar Venta';
    this.productoService.obtenerProducto(this.id!).subscribe(data => {
      this.productoForm.patchValue({
        vendedor: data.vendedor,
        nombre: data.nombre,
        rut: data.rut,
        telefono: data.telefono,
        precio: data.precio,
        abono: data.abono,
        saldo: data.saldo,
        fecha: data.fecha ? new Date(data.fecha).toISOString().substring(0, 10) : '',
        observacion: data.observacion,
        tipoPago: data.tipoPago
      });

      const tablasData = data.tablas || [];
      this.inicializarTablas(tablasData);
    }, error => {
      console.error('Error al obtener el producto para edición:', error);
      this.toastrService.error('Hubo un error al obtener el producto para edición', 'Error');
    });
  }

  inicializarTablas(tablasData: any[]) {
    this.tablas.clear();
    if (tablasData.length === 0) {
      this.tablas.push(this.crearTabla());
    } else {
      for (const tablaData of tablasData) {
        this.tablas.push(this.crearTabla(tablaData));
      }
    }
  }

  crearTabla(tablaData: any = null): FormGroup {
    return this.fb.group({
      odEsferico: [tablaData ? tablaData.odEsferico : '', Validators.required],
      odCilindro: [tablaData ? tablaData.odCilindro : '', Validators.required],
      odEje: [tablaData ? tablaData.odEje : '', Validators.required],
      odAdicion: [tablaData ? tablaData.odAdicion : '', Validators.required],
      odDp: [tablaData ? tablaData.odDp : '', Validators.required],
      osEsferico: [tablaData ? tablaData.osEsferico : '', Validators.required],
      osCilindro: [tablaData ? tablaData.osCilindro : '', Validators.required],
      osEje: [tablaData ? tablaData.osEje : '', Validators.required],
      osAdicion: [tablaData ? tablaData.osAdicion : '', Validators.required],
      osDp: [tablaData ? tablaData.osDp : '', Validators.required],
    });
  }

  agregarNuevaTabla(): void {
    this.tablas.push(this.crearTabla());
  }

  eliminarTabla(index: number): void {
    this.tablas.removeAt(index);
  }

  agregarProducto() {
    // Limpiar valores antes de asignar al producto
    const precioValue = this.limpiarNumeros(this.productoForm.get('precio')?.value);
    const abonoValue = this.limpiarNumeros(this.productoForm.get('abono')?.value);

    const saldo = this.calcularSaldo();
    const producto: Producto = {
      vendedor: this.productoForm.get('vendedor')?.value,
      nombre: this.productoForm.get('nombre')?.value,
      rut: this.productoForm.get('rut')?.value,
      telefono: this.productoForm.get('telefono')?.value,
      precio: parseFloat(precioValue), // Convertir a número limpio
      abono: parseFloat(abonoValue),   // Convertir a número limpio
      saldo: saldo !== null ? saldo : 0,
      fecha: this.productoForm.get('fecha')?.value,
      observacion: this.productoForm.get('observacion')?.value,
      tipoPago: this.productoForm.get('tipoPago')?.value,
      tablas: this.tablas.getRawValue()
    };

    if (this.id !== null) {
      this.productoService.editarProducto(this.id, producto).subscribe(
        data => {
          this.toastrService.info('El producto fue actualizado con éxito', 'Producto Actualizado');
          this.volver();
        },
        error => {
          console.error('Error al editar producto:', error);
          this.toastrService.error('Hubo un error al actualizar el producto', 'Error');
        }
      );
    } else {
      this.productoService.guardarProducto(producto).subscribe(
        data => {
          this.toastrService.success('El producto fue registrado con éxito', 'Producto Registrado');
          this.volver();
        },
        error => {
          console.error('Error al guardar producto:', error);
          this.toastrService.error('Hubo un error al guardar el producto', 'Error');
        }
      );
    }
  }

  calcularSaldo(): number | null {
    const precio = parseFloat(this.limpiarNumeros(this.productoForm.get('precio')?.value));
    const abono = parseFloat(this.limpiarNumeros(this.productoForm.get('abono')?.value));
    return precio !== null && abono !== null ? precio - abono : null;
  }

  private actualizarSaldo() {
    const saldoControl = this.productoForm.get('saldo');
    if (saldoControl) {
      saldoControl.setValue(this.calcularSaldo());
    }
  }

  volver(): void {
    if (this.from === 'main') {
      this.router.navigate(['/main']);
    } else if (this.from === 'listar-productos') {
      this.router.navigate(['/listar-productos']);
    } else {
      this.router.navigate(['/main']);
    }
  }

 limpiarNumeros(valor: string | null): string {
  if (typeof valor !== 'string' || !valor) return '';
  // Eliminar caracteres no numéricos excepto puntos y comas
  return valor.replace(/[^\d.,]/g, '');
}
  descargarPDF() {
    // Capturar el elemento que contiene el formulario
    const element = document.getElementById('pdfForm')!;
  
    // Ocultar botones u otros elementos
    const botones = element.querySelectorAll('button'); // Suponiendo que los botones se quieren ocultar
    botones.forEach((boton: HTMLElement) => {
      boton.style.display = 'none'; // Ocultar cada botón
    });
  
    // Crear un canvas con html2canvas
    html2canvas(element, { width: element.scrollWidth, height: element.scrollHeight }).then((canvas) => {
      // Mostrar nuevamente los botones u otros elementos si es necesario
      botones.forEach((boton: HTMLElement) => {
        boton.style.display = ''; // Mostrar de nuevo los botones
      });
  
      // Convertir el canvas a datos URL
      const imgData = canvas.toDataURL('image/png');
  
      // Configurar el tamaño del PDF (A4: 210 x 297 mm)
      const pdf = new jsPDF('p', 'mm', 'a4');
  
      // Calcular el ancho y alto del PDF para que coincida con A4
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
  
      // Calcular el ratio de aspecto del canvas y del PDF
      const canvasRatio = canvas.width / canvas.height;
      const pdfRatio = pdfWidth / pdfHeight;
  
      // Calcular las dimensiones del canvas para que quepa en el PDF
      let canvasImageWidth = pdfWidth;
      let canvasImageHeight = pdfWidth / canvasRatio;
  
      // Si la altura del canvas resultante es mayor que la altura del PDF, ajustar las dimensiones
      if (canvasImageHeight > pdfHeight) {
        canvasImageWidth = pdfHeight * canvasRatio;
        canvasImageHeight = pdfHeight;
      }
  
      // Agregar la imagen al PDF centrada
      const marginX = (pdfWidth - canvasImageWidth) / 2;
      const marginY = (pdfHeight - canvasImageHeight) / 2;
      pdf.addImage(imgData, 'PNG', marginX, marginY, canvasImageWidth, canvasImageHeight);
  
      // Descargar el PDF
      pdf.save('formulario.pdf');
    });
  }
  }

  