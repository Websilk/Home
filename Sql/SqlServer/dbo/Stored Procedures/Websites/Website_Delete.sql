-- =============================================
-- Author:		Mark Entingh
-- Create date: 10/5/2008
-- Description:	set [delete] = 1 for a website & all web pages as a temporary deletion
-- =============================================
CREATE PROCEDURE [dbo].[Website_Delete] 
	@websiteId int = 0,
	@ownerId int = 0
AS
BEGIN
	SET NOCOUNT ON;
	DELETE FROM Websites WHERE websiteId=@websiteId AND ownerId=@ownerid
END
