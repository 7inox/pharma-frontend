package pe.edu.upeu.Practica.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data

public class VentaResponseDTO {
    private Long id;
    private LocalDateTime fecha;

    private Long clienteId;
    private String clienteNombre;

    private String estado;
    private BigDecimal total;

    private List<DetalleVentaResponseDTO> detalles;
}
