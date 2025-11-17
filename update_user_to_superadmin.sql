-- Query para convertir el usuario con email 'ignacioaguirre861@gmail.com' a SuperAdmin
-- Ejecutar este query en la base de datos PostgreSQL

-- Primero, asegurarse de que el rol SuperAdmin existe
INSERT INTO roles (id, name, "deletedAt")
SELECT gen_random_uuid(), 'SuperAdmin', NULL
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'SuperAdmin');

-- Agregar el rol SuperAdmin al usuario (sin eliminar otros roles existentes)
INSERT INTO "userRoles" ("usersId", "rolesId")
SELECT 
    u.id,
    r.id
FROM users u
CROSS JOIN roles r
WHERE u.email = 'ignacioaguirre861@gmail.com'
  AND r.name = 'SuperAdmin'
  AND NOT EXISTS (
    SELECT 1 
    FROM "userRoles" ur 
    WHERE ur."usersId" = u.id 
      AND ur."rolesId" = r.id
  );

-- Verificar que el usuario ahora tiene el rol SuperAdmin
SELECT 
    u.email,
    u."userName",
    u.name,
    array_agg(r.name) as roles
FROM users u
LEFT JOIN "userRoles" ur ON u.id = ur."usersId"
LEFT JOIN roles r ON ur."rolesId" = r.id
WHERE u.email = 'ignacioaguirre861@gmail.com'
GROUP BY u.id, u.email, u."userName", u.name;

