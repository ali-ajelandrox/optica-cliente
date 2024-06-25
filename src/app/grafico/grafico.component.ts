import { Component, OnInit } from '@angular/core';
import { ProductoService } from '../services/producto.ts.service';
import { Producto } from '../models/producto';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-grafico',
  templateUrl: './grafico.component.html',
  styleUrls: ['./grafico.component.css']
})
export class GraficoComponent implements OnInit {
  listProductos: Producto[] = [];
  single: any[] = []; // Array para los datos del gráfico
  view: [number, number] = [1000, 400];
  gradient: boolean = true;
  showLegend: boolean = true;
  showLabels: boolean = true;
  selectedMonth: string = '';
  selectedYear: number = new Date().getFullYear(); // Inicializar con el año actual
  colorScheme = {
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
  };
  currentFilter: string = 'vendedor';
  total: number = 0;
  isIngresosView: boolean = false;
  show: boolean = false; // Inicializar show como falso
  availableYears: number[] = []; // Inicializar como un arreglo vacío

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
      this.availableYears = this.getAvailableYears(); // Obtener los años disponibles
      this.applyFilter();
    }, error => {
      console.log(error);
    });
  }

  getAvailableYears(): number[] {
    const years = this.listProductos.map(producto => new Date(producto.fecha).getFullYear());
    return [...new Set(years)]; // Filtrar años duplicados usando un Set
  }

  applyFilter() {
    const filteredData = this.selectedMonth && this.selectedYear
      ? this.listProductos.filter(producto => {
          const fecha = new Date(producto.fecha);
          return fecha.getMonth() === parseInt(this.selectedMonth) && fecha.getFullYear() === this.selectedYear;
        })
      : this.listProductos;

    if (this.currentFilter === 'vendedor') {
      this.actualizarGraficoPorVendedor(filteredData);
    } else if (this.currentFilter === 'ventas') {
      this.actualizarGraficoPorMes(filteredData);
    } else if (this.currentFilter === 'ingresos') {
      this.actualizarGraficoIngresosPorMes(filteredData);
    }
  }

  ventasPorVendedor() {
    this.currentFilter = 'vendedor';
    this.isIngresosView = false;
    this.applyFilter();
  }

  ventasGenerales() {
    this.currentFilter = 'ventas';
    this.isIngresosView = false;
    this.applyFilter();
  }

  balanceIngresos() {
    this.currentFilter = 'ingresos';
    this.isIngresosView = true;
    this.applyFilter();
  }

  actualizarGraficoPorVendedor(data: Producto[]) {
    const ventasPorVendedor: { [key: string]: number } = data.reduce((acc: { [key: string]: number }, producto: Producto) => {
      if (!acc[producto.vendedor]) {
        acc[producto.vendedor] = 0;
      }
      acc[producto.vendedor]++;
      return acc;
    }, {});

    this.single = Object.keys(ventasPorVendedor).map(vendedor => ({
      name: vendedor,
      value: ventasPorVendedor[vendedor]
    }));
    this.total = this.single.reduce((sum, item) => sum + item.value, 0);
  }

  actualizarGraficoPorMes(data: Producto[]) {
    const ventasPorMes: { [key: string]: number } = data.reduce((acc: { [key: string]: number }, producto: Producto) => {
      const mes = new Date(producto.fecha).toLocaleString('default', { month: 'long' });
      if (!acc[mes]) {
        acc[mes] = 0;
      }
      acc[mes]++;
      return acc;
    }, {});

    this.single = Object.keys(ventasPorMes).map(mes => ({
      name: mes,
      value: ventasPorMes[mes]
    }));
    this.total = this.single.reduce((sum, item) => sum + item.value, 0);
  }

  actualizarGraficoIngresosPorMes(data: Producto[]) {
    const ingresosPorMes: { [key: string]: number } = data.reduce((acc: { [key: string]: number }, producto: Producto) => {
      const mes = new Date(producto.fecha).toLocaleString('default', { month: 'long' });
      if (!acc[mes]) {
        acc[mes] = 0;
      }
      acc[mes] += producto.abono - producto.saldo;
      return acc;
    }, {});

    this.single = Object.keys(ingresosPorMes).map(mes => ({
      name: mes,
      value: ingresosPorMes[mes]
    }));
    this.total = this.single.reduce((sum, item) => sum + item.value, 0);
  }

  onSelect(event: any): void {
    console.log('Item clicked', event);
  }

  onActivate(event: any): void {
    console.log('Activate', event);
  }

  onDeactivate(event: any): void {
    console.log('Deactivate', event);
  }

  toggleCollapse() {
    this.show = !this.show;
  }



  
}
