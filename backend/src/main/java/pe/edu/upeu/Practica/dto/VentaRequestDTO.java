package pe.edu.upeu.Practica.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class VentaRequestDTO {
    @NotNull(
            message = "El cliente es obligatorio"
    )
    @Positive(
            message = "El identificador del cliente debe ser válido"
    )
    private Long clienteId;

    @NotEmpty(
            message = "La venta debe contener al menos un detalle"
    )
    @Valid
    private List<DetalleVentaRequestDTO> detalles;
}
