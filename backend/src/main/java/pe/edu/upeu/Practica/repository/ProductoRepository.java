package pe.edu.upeu.Practica.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.upeu.Practica.entity.Producto;

import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    @Override
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = "categoria")
    org.springframework.data.domain.Page<Producto> findAll(org.springframework.data.domain.Pageable pageable);

    boolean existsByNombreIgnoreCase(String nombre);
    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Long id);

    List<Producto> findByCategoriaId(Long categoriaId);
    boolean existsByCategoriaId(Long categoriaId);
}
