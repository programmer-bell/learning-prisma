const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseLoginForm(formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');

  if (typeof email !== 'string' || typeof password !== 'string') {
    return { error: 'Email and password are required.' } as const;
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(normalizedEmail) || password.length === 0 || password.length > 128) {
    return { error: 'Invalid email or password.' } as const;
  }

  return { email: normalizedEmail, password } as const;
}

export function parseRegistrationForm(formData: FormData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');

  if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    return { error: 'All fields are required.' } as const;
  }

  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedName.length < 2 || normalizedName.length > 80) {
    return { error: 'Name must be between 2 and 80 characters.' } as const;
  }
  if (normalizedEmail.length > 254 || !EMAIL_PATTERN.test(normalizedEmail)) {
    return { error: 'Enter a valid email address.' } as const;
  }
  if (password.length < 12 || password.length > 128) {
    return { error: 'Password must be between 12 and 128 characters.' } as const;
  }

  return { name: normalizedName, email: normalizedEmail, password } as const;
}

export function parseNoteForm(formData: FormData) {
  const title = formData.get('title');
  const content = formData.get('content');
  const rawTagIds = formData.getAll('tags');

  if (typeof title !== 'string' || typeof content !== 'string') {
    return { error: 'Title and content are required.' } as const;
  }

  const normalizedTitle = title.trim();
  const normalizedContent = content.trim();
  if (!normalizedTitle || normalizedTitle.length > 160) {
    return { error: 'Title is required and must be 160 characters or fewer.' } as const;
  }
  if (!normalizedContent || normalizedContent.length > 20000) {
    return { error: 'Content is required and must be 20,000 characters or fewer.' } as const;
  }
  if (rawTagIds.length > 20 || rawTagIds.some((tagId) => typeof tagId !== 'string')) {
    return { error: 'Choose no more than 20 valid tags.' } as const;
  }

  return {
    title: normalizedTitle,
    content: normalizedContent,
    tagIds: [...new Set(rawTagIds as string[])],
  } as const;
}