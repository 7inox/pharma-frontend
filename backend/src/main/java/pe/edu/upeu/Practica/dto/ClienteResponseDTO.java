package pe.edu.upeu.Practica.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class ClienteResponseDTO {
    private Long id;
    private String dni;
    private String nombres;
    private String apellidos;
    private String email;
    private String telefono;
    private String direccion;
    private Boolean estado;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaModificacion;
}
