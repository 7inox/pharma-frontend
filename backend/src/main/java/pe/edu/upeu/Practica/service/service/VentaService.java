package pe.edu.upeu.Practica.service.service;

import pe.edu.upeu.Practica.dto.VentaRequestDTO;
import pe.edu.upeu.Practica.dto.VentaResponseDTO;
import pe.edu.upeu.Practica.enums.EstadoVenta;

import java.time.LocalDate;
import java.util.List;

public interface VentaService {
    VentaResponseDTO registrar(VentaRequestDTO request);
    VentaResponseDTO buscar(Long id);
    List<VentaResponseDTO> listar();
    List<VentaResponseDTO> buscar(
            Long clienteId,
            EstadoVenta estado,
            LocalDate desde,
            LocalDate hasta,
            String ordenarPor,
            String direccion
    );
}
