package pe.edu.upeu.Practica.dto.reporte;

import java.math.BigDecimal;

public record VentaPorCategoriaDTO(Long categoriaId, String categoriaNombre, Long unidadesVendidas, BigDecimal montoTotal) {
}
