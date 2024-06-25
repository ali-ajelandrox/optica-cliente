import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private url = 'http://localhost:4000/api/producto/';

  constructor(private http: HttpClient) { }

  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.url);
  }

  eliminarProducto(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}${id}`);
  }

  guardarProducto(producto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.url, producto);
  }

  obtenerProducto(id: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.url}${id}`);
  }

  editarProducto(id: string, producto: Producto): Observable<Producto> {
    return this.http.put<Producto>(`${this.url}${id}`, producto);
  }

  obtenerDatosGrafico(): Observable<any[]> {
    return this.http.get<any[]>(`${this.url}/datosgrafico`);
  }

  buscarProductosPorNombre(nombre: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.url}/buscar?nombre=${nombre}`);
  }

  incrementarContador(id: string): Observable<void> {
    return this.http.put<void>(`${this.url}incrementar/${id}`, null);

    
  }
}


