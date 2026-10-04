package pe.edu.upeu.Practica.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class CategoriaDTO {
    private Long id;
    private String nombre;
    private String descripcion;
    private Boolean estado;
}
