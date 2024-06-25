import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListarProductosComponent } from './listar-productos/listar-productos.component';
import { CrearProductoComponent } from './crear-producto/crear-producto.component';
import { MainComponent } from './main/main.component';
import { GraficoComponent } from './grafico/grafico.component';

const routes: Routes = [
  { path: '', redirectTo: '/main', pathMatch: 'full' },
  { path: 'main', component: MainComponent },
  { path: 'listar-productos', component: ListarProductosComponent },
  { path: 'crear-producto', component: CrearProductoComponent },
  { path: 'editar-producto/:id', component: CrearProductoComponent },
  { path: 'ver-grafico', component: GraficoComponent },
  { path: '**', redirectTo: '/main', pathMatch: 'full' }, // Coloca esta al final de todas las demás rutas
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
