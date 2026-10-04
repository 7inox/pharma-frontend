package pe.edu.upeu.Practica.service.service;

import pe.edu.upeu.Practica.dto.ClienteRequestDTO;
import pe.edu.upeu.Practica.dto.ClienteResponseDTO;
import pe.edu.upeu.Practica.service.generic.CrudService;

import pe.edu.upeu.Practica.dto.PaginaResponseDTO;
public interface ClienteService extends CrudService<ClienteRequestDTO, ClienteResponseDTO, Long> {
    PaginaResponseDTO<ClienteResponseDTO> listar(int pagina, int tamanio, String ordenarPor, String direccion);
}
