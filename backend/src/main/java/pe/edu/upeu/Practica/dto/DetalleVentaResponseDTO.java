package pe.edu.upeu.Practica.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class DetalleVentaResponseDTO {
    private Long productoId;
    private String productoNombre;
    private Integer cantidad;
    private BigDecimal precio;
    private BigDecimal subtotal;
}
