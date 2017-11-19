CREATE TABLE [dbo].[Websites] (
    [websiteId]		INT				NOT NULL,
    [ownerId]		INT				NOT NULL,
    [title]			NVARCHAR (100)	NOT NULL,
    [datecreated]	DATETIME		NOT NULL,
    [status]		INT				NULL,
    [enabled]		BIT				NULL,
    [deleted]		BIT				NULL,
	[domain]		NVARCHAR(255)	NULL, 
    [liveUrl]		NVARCHAR(255)	NULL, 
    [stageUrl]		NVARCHAR(255)	NULL, 
	[logo]			BIT				NOT NULL DEFAULT 0
    CONSTRAINT [PK_Websites] PRIMARY KEY ([websiteId])
);


GO

CREATE INDEX [index_websites] ON [dbo].[Websites] (websiteId)
