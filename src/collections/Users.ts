import type { Access, CollectionConfig } from 'payload'

/**
 * Only an existing signed-in user may touch the user list — there is no public
 * signup on this site, and no reason for one.
 *
 * This does not lock you out of a fresh database: the create-first-user flow
 * runs through Payload's `registerFirstUser` operation, which sets
 * `overrideAccess: true` and only fires while the collection is empty.
 */
const signedIn: Access = ({ req }) => Boolean(req.user)

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'updatedAt'],
    group: 'Site',
    description: 'Who can sign in to this admin. Keep it to the people who need it.',
  },
  access: {
    create: signedIn,
    read: signedIn,
    update: signedIn,
    delete: signedIn,
    unlock: signedIn,
    // `admin` gates entry to the panel itself and is typed narrower than the
    // rest — strictly boolean, since "can you open the admin" has no query form
    // to answer it with.
    admin: ({ req }) => Boolean(req.user),
  },
  auth: {
    // Five wrong passwords parks the account for ten minutes. Against an online
    // guessing attempt this is what actually does the work — the admin living at
    // /studio instead of /admin only keeps it off the broad scanner lists.
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    // Sessions last a working day and refresh while you're using the panel,
    // rather than the two hours Payload defaults to.
    tokenExpiration: 8 * 60 * 60,
    cookies: {
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    },
    // No machine-to-machine keys are issued from here; anything that reads the
    // site does so through the public read access on each collection.
    useAPIKey: false,
    // 30 minutes is plenty to get from the inbox to the form.
    forgotPassword: {
      expiration: 30 * 60 * 1000,
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      admin: {
        description: 'Shown in the admin instead of the bare email address.',
      },
    },
  ],
}
