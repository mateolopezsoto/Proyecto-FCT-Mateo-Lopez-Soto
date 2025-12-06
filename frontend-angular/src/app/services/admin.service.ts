import { Injectable, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { last, lastValueFrom } from "rxjs";
import { ReservaUsuario } from "./reserva.service";
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

export interface Estatisticas {
    contadores: {
        reservas: number;
        instalacions: number;
        usuarios: number;
    };
    graficas: {
        por_instalacion: { nombre: string; total: number; }[];
        por_hora: { hora: string; total: number; }[];
    }
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
    reservas = signal<ReservaUsuario[]>([]);
    estatisticas = signal<Estatisticas | null>(null);

    constructor() {}

    /**
     * Obten instalacións e tipos de instalación do backend 
     * Usado no panel de administración
     */
    async cargarDatos()  {
        if (this.loading()) return;
        this.loading.set(true);

        try {
            const [instalacionsData, tiposData] = await Promise.all([
                lastValueFrom(this.http.get<InstalacionAdmin[]>(`${this.apiUrl}/admin/instalacions`)),
                lastValueFrom(this.http.get<TipoInstalacion[]>(`${this.apiUrl}/tipos-instalacion`))
            ]);
            // Actualiza signals
            this.instalacions.set(instalacionsData || []);
            this.tipos.set(tiposData || []);
        } catch (error: any) {
            console.error('Error cargando datos de administración:', error);
            Swal.fire('Erro', 'Non se puideron cargar os datos de administración', 'error');
        } finally {
            this.loading.set(false);
        }
    }

    /**
     * Solicita ao backend eliminar unha instalación
     * @param id: É o id da instalación
     * Amosa confirmación antes de borrar
     * Actualiza a lista local
     */
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

    /**
     * Envía datos ao backend para crear unha nova instalación
     * @param datos: Son os datos a enviar
     * @returns true se se creou correctamente a instalación
     * Recarga os datos
     */
    async crearInstalacion(datos: any) {
        this.loading.set(true);
        try {
            await lastValueFrom(this.http.post(`${this.apiUrl}/admin/instalacions`, datos));

            Swal.fire({
                icon: 'success',
                title: 'Creada!',
                text: 'A instalación creouse correctamente',
                confirmButtonColor: '#E2EFDA',
                confirmButtonText: '<span style="color:#333">Aceptar</span>'
            });

            await this.cargarDatos();
            return true;
        } catch (error: any) {
            const msg = error.error?.message || 'Erro ao crear a instalación';
            Swal.fire('Erro', msg, 'error');
            return false;
        } finally {
            this.loading.set(false);
        }
    }

    /**
     * Crea un novo tipo de instalación
     * @param nome: É o nome do novo tipo
     * @returns true se conseguiu crear o novo tipo
     * Recarga a lista
     */
    async crearTipoInstalacion(nome: string) {
        this.loading.set(true);
        try {
            await lastValueFrom(this.http.post(`${this.apiUrl}/tipos-instalacion`, { nome_tipo: nome }));

            const tiposData = await lastValueFrom(this.http.get<TipoInstalacion[]>(`${this.apiUrl}/tipos-instalacion`));
            this.tipos.set(tiposData || []);

            Swal.fire({
                icon: 'success',
                title: 'Tipo creado',
                text: `O tipo "${nome}" foi creado correctamente`,
                timer: 2000,
                showConfirmButton: false
            });
            return true;
        } catch(error: any) {
            Swal.fire('Erro', 'Non se puido crear o tipo. Pode que xa exista', 'error');
            return false;
        } finally {
            this.loading.set(false);
        }
    }

    /**
     * Obtén unha instalación
     * @param id: O id da instalación a obter
     * @returns: Devolve os datos da instalación pedida
     */
    async getInstalacion(id: number): Promise<InstalacionAdmin> {
        return lastValueFrom(
            this.http.get<InstalacionAdmin>(`${this.apiUrl}/admin/instalacions/${id}`)
        );
    }

    /**
     * Actualiza unha instalación existente
     * @param id: O id da instalación a editar
     * @param datos: Os novos datos da instalación
     * @returns true se se edita correctamente
     */
    async editarInstalacion(id: number, datos: any) {
        this.loading.set(true);
        try {
            await lastValueFrom(this.http.put(`${this.apiUrl}/admin/instalacions/${id}`, datos));

            Swal.fire({
                icon: 'success',
                title: 'Actualizada!',
                text: 'A instalación actualizouse correctamente',
                confirmButtonColor: '#E2EFDA',
                confirmButtonText: '<span style="color:#333">Aceptar</span>'
            });
            return true;
        } catch (error: any) {
            const msg = error.error?.message || 'Erro ao actualizar a instalación';
            Swal.fire('Erro', msg, 'error');
            return false;
        } finally {
            this.loading.set(false);
        }
    }

    /**
     * Carga todas as reservas
     * GET /api/admin/reservas
     */
    async cargarReservas() {
        this.loading.set(true);
        try {
            const data = await lastValueFrom(
                this.http.get<ReservaUsuario[]>(`${this.apiUrl}/admin/reservas`)
            );
            this.reservas.set(data || []);
        } catch (error: any) {
            Swal.fire('Erro', 'Non se puideron cargar as reservas', 'error');
        } finally {
            this.loading.set(false);
        }
    }

    /**
     * Cambia o estado dunha reserva
     * @param id: O id da reserva
     * @param nuevoEstado: O novo estado da reserva
     * @returns true se se actualiza o estado correctamente
     */
    async cambiarEstadoReserva(id: number, nuevoEstado: string) {
        this.loading.set(true);
        try {
            await lastValueFrom(
                this.http.put(`${this.apiUrl}/admin/reservas/${id}/estado`, { estado: nuevoEstado })
            );

            this.reservas.update(list => 
                list.map(r => r.id_reserva === id ? { ...r, estado: nuevoEstado as any } : r)
            );

            Swal.fire('Actualizado!', `O estado cambiouse a "${nuevoEstado}"`, 'success');
            return true;
        } catch (error: any) {
            Swal.fire('Erro', 'Non se puido cambiar o estado', 'error');
            return false;
        } finally {
            this.loading.set(false);
        }
    }

    /**
     * Carga estatísticas para o panel admin
     */
    async cargarEstatisticas() {
        this.loading.set(true);
        try {
            const data = await lastValueFrom(
                this.http.get<Estatisticas>(`${this.apiUrl}/admin/estatisticas`)
            );
            this.estatisticas.set(data);
            } catch(error) {
                Swal.fire('Erro', 'Non se puideron cargar as estatísticas', 'error');
            } finally {
                this.loading.set(false);
            }
     }

     /**
      * Descarga o CSV xerado polo backend
      */
     async exportarInforme() {
        this.loading.set(true);
        try {
            const response = await lastValueFrom(
                this.http.get(`${this.apiUrl}/admin/estatisticas/exportar`, {
                    responseType: 'blob',
                    observe: 'response'
                })
            );

            const blob = new Blob([response.body!], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'informe_reservas.csv';
            a.click();
            window.URL.revokeObjectURL(url);

            Swal.fire('Éxito', 'Informe descargado correctamente', 'success');
        } catch (error) {
            Swal.fire('Erro', 'Non se puido descargar o informe', 'error');
        } finally {
            this.loading.set(false);
        }
     }
    
}