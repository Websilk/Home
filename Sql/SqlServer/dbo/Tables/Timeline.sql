CREATE TABLE [dbo].[Timeline] (
    [timelineId]  NVARCHAR (10)  NOT NULL,
    [userId]    INT            NULL,
    [websiteId]   INT            NULL,
    [datecreated] DATETIME       NOT NULL,
    [title]       NVARCHAR (255) NOT NULL,
    [url]         NVARCHAR (255) NULL,
    [photo]       NVARCHAR (255) NULL,
    [summary]     NVARCHAR (MAX) NULL, 
    CONSTRAINT [PK_Timeline] PRIMARY KEY ([timelineId])
);


GO

CREATE INDEX [index_timeline] ON [dbo].[Timeline] (datecreated DESC)

GO

CREATE INDEX [index_timeline_website] ON [dbo].[Timeline] (websiteId, datecreated DESC)

GO

CREATE INDEX [index_timeline_user] ON [dbo].[Timeline] (userId, datecreated DESC)
