package pe.edu.upeu.Practica.service.service;

import pe.edu.upeu.Practica.dto.reporte.ProductoMasVendidoDTO;
import pe.edu.upeu.Practica.dto.reporte.VentaPorCategoriaDTO;

import java.time.LocalDate;
import java.util.List;

public interface ReporteService {
    List<VentaPorCategoriaDTO> ventasPorCategoria(
            LocalDate desde,
            LocalDate hasta);

    List<ProductoMasVendidoDTO> productosMasVendidos(
            LocalDate desde,
            LocalDate hasta);
}
