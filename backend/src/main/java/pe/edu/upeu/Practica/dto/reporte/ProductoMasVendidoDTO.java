package pe.edu.upeu.Practica.dto.reporte;

import java.math.BigDecimal;

public record ProductoMasVendidoDTO(Long productoId, String productoNombre, String categoriaNombre, Long cantidadVendida, BigDecimal montoTotal) {

}
