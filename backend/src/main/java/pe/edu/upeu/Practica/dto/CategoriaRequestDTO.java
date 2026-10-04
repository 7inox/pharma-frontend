package pe.edu.upeu.Practica.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CategoriaRequestDTO {
    @NotBlank(message = "El nombre no puede estar vacío")
    @Size(min = 3,max = 50, message = "El nombre no puede tener más de 50 caracteres")
    private String nombre;
    @Size(max = 200, message = "La descripción no puede tener más de 200 caracteres")
    private String descripcion;
    @NotNull(message = "El estado es obligatorio")
    private Boolean estado;

}
