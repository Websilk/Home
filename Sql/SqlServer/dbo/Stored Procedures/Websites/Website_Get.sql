-- =============================================
-- Author:		Mark Entingh
-- Create date: 9/2/2008
-- Description:	get website information
-- =============================================
CREATE PROCEDURE [dbo].[Website_Get] 
	@websiteId int = 0
AS
BEGIN
	SET NOCOUNT ON;
	SELECT *
	FROM websites
	WHERE websiteId=@websiteId
	AND deleted=0
	AND [enabled]=1
END
