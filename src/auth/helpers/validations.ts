
export class Validations {
    public validationFields(email: string, password: string, name: string) {
        if (!email || !password || !name) {
            throw new Error('Faltan campos obligatorios: nombre, correo o contraseña.');
        }
    }

    public validationEmail(email: string) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('El correo electrónico no tiene un formato válido.');
        }
    }

    public validationPassword(password: string) {
        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        if (!passwordRegex.test(password)) {
            throw new Error(
                'La contraseña debe tener al menos 6 caracteres, incluyendo una letra mayúscula, una letra minúscula, un número y un carácter especial.'
            );
        }
    }
}
