CREATE TABLE [dbo].[Users] (
    [userId]         INT            NOT NULL,
    [email]            NVARCHAR (75)  NOT NULL,
    [password]         NVARCHAR (100) NOT NULL,
    [displayname]      NVARCHAR (25)  NULL,
    [photo]            NVARCHAR (30)  NULL,
    [lastlogin]        DATETIME       NULL,
    [datecreated]      DATETIME       NOT NULL,
    [status]           INT            NOT NULL,
    [signupip]         NVARCHAR (15)  NULL,
    [referrer]         NVARCHAR (250) NULL,
    [activation]       NCHAR (20)     NULL,
    [deleted]          BIT            NOT NULL,
    CONSTRAINT [PK_Users] PRIMARY KEY ([email])
);


GO

CREATE INDEX [index_users] ON [dbo].[Users] (userId)

GO

CREATE INDEX [index_users_email] ON [dbo].[Users] (email)
