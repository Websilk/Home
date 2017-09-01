CREATE TABLE [dbo].[Security] (
    [security]		BINARY(32)		NULL,
    [websiteId]		INT				NOT NULL,
    [pageId]		INT				NOT NULL,
    [groupId]		INT				NULL,
    [userId]		INT				NULL,
    [feature]		NVARCHAR (50)	NULL
);

GO

CREATE INDEX [index_security] ON [dbo].[Security] (websiteId)
