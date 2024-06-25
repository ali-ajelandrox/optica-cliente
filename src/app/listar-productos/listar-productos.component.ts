// listar-productos.component.ts
import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../services/producto.ts.service';
import { Producto } from '../models/producto';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-listar-productos',
  templateUrl: './listar-productos.component.html',
  styleUrls: ['./listar-productos.component.css']
})
export class ListarProductosComponent implements OnInit {
  listProductos: Producto[] = [];

  constructor(
    private _productoService: ProductoService,
    private toastr: ToastrService,

  ) {}

  ngOnInit(): void {
    this.obtenerProductos();
  }

  obtenerProductos() {
    this._productoService.getProductos().subscribe(data => {
      this.listProductos = data;
      const productosConFechaISO = data.map(producto => ({
        ...producto,
        fecha: new Date(producto.fecha).toISOString() // Convertir fecha a cadena ISO
      }));
      
    }, error => {
      console.log(error);
    });
  }

  eliminarProducto(id: any) {
    this._productoService.eliminarProducto(id).subscribe(data => {
      this.toastr.error('El producto fue eliminado con éxito', 'Producto eliminado');
      this.obtenerProductos();
    }, error => {
      console.log(error);
    });
  }

  descargarExcel(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(document.getElementById('tabla'));
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tabla');
    XLSX.writeFile(wb, 'tabla.xlsx');
  }
}
