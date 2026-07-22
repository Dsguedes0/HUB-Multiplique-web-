/**
 * Tamanho mínimo de senha único para cadastro e redefinição — antes
 * inconsistente (6 no cadastro, 8 na redefinição). Ver auditoria de
 * código, item #12.
 */
export const MIN_PASSWORD_LENGTH = 8;

export function passwordError(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  return null;
}
