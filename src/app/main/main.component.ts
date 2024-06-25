import { Component } from '@angular/core';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {
  titulo:string='Componente principal';
  descripcion: string = 'Este es el componente principal de la aplicación.';
}
