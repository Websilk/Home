CREATE TABLE [dbo].[Timeline] (
    [timelineId]  NVARCHAR (10)  NOT NULL,
    [userId]    INT            NULL,
    [websiteId]   INT            NULL,
    [dateCreated] DATETIME       NOT NULL,
    [title]       NVARCHAR (255) NOT NULL,
    [url]         NVARCHAR (255) NULL,
    [photo]       NVARCHAR (255) NULL,
    [summary]     NVARCHAR (MAX) NULL, 
    CONSTRAINT [PK_Timeline] PRIMARY KEY ([timelineId])
);


GO

CREATE INDEX [index_timeline] ON [dbo].[Timeline] (dateCreated DESC)

GO

CREATE INDEX [index_timeline_website] ON [dbo].[Timeline] (websiteId, dateCreated DESC)

GO

CREATE INDEX [index_timeline_user] ON [dbo].[Timeline] (userId, dateCreated DESC)
