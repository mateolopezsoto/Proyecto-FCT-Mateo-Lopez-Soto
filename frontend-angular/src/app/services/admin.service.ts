import { Injectable, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { lastValueFrom } from "rxjs";
import Swal from 'sweetalert2';

export interface TipoInstalacion {
    id_tipo: number;
    nome_tipo: string;
}

export interface InstalacionAdmin {
    id_instalacion: number;
    nome: string;
    capacidade: number;
    estado: string;
    id_tipo: number;
    tipo?: TipoInstalacion;
}

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private http = inject(HttpClient);
    private apiUrl = 'http://127.0.0.1:8000/api';

    instalacions = signal<InstalacionAdmin[]>([]);
    tipos = signal<TipoInstalacion[]>([]);
    loading = signal(false);

    constructor() {}

    async cargarDatos()  {
        if (this.loading()) return;
        this.loading.set(true);

        try {
            const [instalacionsData, tiposData] = await Promise.all([
                lastValueFrom(this.http.get<InstalacionAdmin[]>(`${this.apiUrl}/admin/instalacions`)),
                lastValueFrom(this.http.get<TipoInstalacion[]>(`${this.apiUrl}/tipos-instalacion`))
            ]);

            this.instalacions.set(instalacionsData || []);
            this.tipos.set(tiposData || []);
        } catch (error: any) {
            console.error('Error cargando datos de administración:', error);
            Swal.fire('Erro', 'Non se puideron cargar os datos de administración', 'error');
        } finally {
            this.loading.set(false);
        }
    }

    async eliminarInstalacion(id: number) {
        const result = await Swal.fire({
            title: 'Estás seguro/a?',
            text: 'Non poderás reverter esta acción. Borrarase a instalación se non ten reservas activas',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DC3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Si, eliminar!',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            this.loading.set(true);
            try {
                await lastValueFrom(
                    this.http.delete(`${this.apiUrl}/admin/instalacions/${id}`)
                );

                this.instalacions.update(insts => 
                    insts.filter(i => i.id_instalacion !== id)
                );

                Swal.fire('Eliminado!', 'A instalación foi eliminada', 'success');
            } catch (error: any) {
                const msg = error.error?.message || 'Non se puido eliminar a instalación';
                Swal.fire('Erro', msg, 'error');
            } finally {
                this.loading.set(false);
            }
        }
    }
}