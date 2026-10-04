package pe.edu.upeu.Practica.service.service;

import pe.edu.upeu.Practica.dto.ProductoRequestDTO;
import pe.edu.upeu.Practica.dto.ProductoResponseDTO;
import pe.edu.upeu.Practica.service.generic.CrudService;

public interface ProductoService extends CrudService<ProductoRequestDTO, ProductoResponseDTO, Long> {
    pe.edu.upeu.Practica.dto.PaginaResponseDTO<ProductoResponseDTO> listar(int pagina, int tamanio, String ordenarPor, String direccion);

}
