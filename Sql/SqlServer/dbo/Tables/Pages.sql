CREATE TABLE [dbo].[Pages] (
    [pageId]             INT            NOT NULL,
    [ownerId]            INT            NOT NULL,
    [websiteId]          INT            NOT NULL,
    [parentId]           INT            NULL,
    [pagetype]			 SMALLINT		NULL, 
	[service]			 NVARCHAR (100) NOT NULL,
	[serviceargs]        NVARCHAR (250) NOT NULL,
    [title]              NVARCHAR (250) NOT NULL,
    [path]               NVARCHAR (MAX) NOT NULL,
    [pathIds]            NVARCHAR (MAX) NOT NULL,
    [description]        NVARCHAR (MAX) NOT NULL,
    [datecreated]        DATETIME       NOT NULL,
    [datemodified]       DATETIME       NOT NULL,
    [datefirstpublished] DATETIME       NULL,
    [datepublished]      DATETIME       NULL,
    [favorite]           BIT            NULL DEFAULT 0,
    [security]           BIT            NULL DEFAULT 0,
    [published]          BIT            NOT NULL DEFAULT 0,
    [enabled]            BIT            NOT NULL DEFAULT 1,
    [deleted]            BIT            NOT NULL DEFAULT 0,
	[version]			 INT			NOT NULL DEFAULT 0,
    [rating]             INT            NULL DEFAULT 0,
    [ratingtotal]        INT            NULL DEFAULT 0,
    [ratingcount]        INT            NULL DEFAULT 0,
    CONSTRAINT [PK_Pages] PRIMARY KEY ([pageId])
);


GO

CREATE INDEX [index_pages] ON [dbo].[Pages] (websiteId, pageId)
